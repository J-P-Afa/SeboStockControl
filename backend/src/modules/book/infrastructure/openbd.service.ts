import { Injectable, Logger } from '@nestjs/common';
import { IExternalBookService } from '../domain/external-book-service.interface';
import { ExternalBookLookupDto } from '../application/dtos/external-book-lookup.dto';
import { IsbnUtils } from '../domain/isbn-utils';

@Injectable()
export class OpenBDService implements IExternalBookService {
  private readonly logger = new Logger(OpenBDService.name);
  private readonly apiUrl = 'https://api.openbd.jp/v1/get';

  async lookupByIsbn(isbn: string): Promise<ExternalBookLookupDto | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      const url = `${this.apiUrl}?isbn=${cleanIsbn}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SeboStockControl/1.0 (sebo-stock-control@example.com)',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `OpenBD API error: ${response.status} ${response.statusText}`,
        );
        return null;
      }

      const data = (await response.json()) as OpenBDResponseItem[];

      if (!Array.isArray(data) || data.length === 0 || data[0] === null) {
        this.logger.debug(`Book with ISBN ${isbn} not found in OpenBD`);
        return null;
      }

      return this.mapToDto(data[0], cleanIsbn);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.warn(`OpenBD lookup timed out for ISBN ${isbn}`);
      } else {
        this.logger.error(
          `Failed to lookup book by ISBN ${isbn} on OpenBD`,
          error instanceof Error ? error.stack : error,
        );
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapToDto(
    data: OpenBDResponseItem,
    originalIsbn: string,
  ): ExternalBookLookupDto {
    const dto = new ExternalBookLookupDto();
    const onix = data.onix || {};
    const hanmoto = data.hanmoto || {};

    const descriptiveDetail = onix.DescriptiveDetail || {};
    const titleDetail = descriptiveDetail.TitleDetail || {};
    const titleElement = titleDetail.TitleElement || {};

    dto.title = titleElement.TitleText || 'Título desconhecido';
    dto.subtitle = titleElement.Subtitle || null;

    // ISBNs
    const baseIsbn = onix.RecordReference || originalIsbn;
    const isbns = IsbnUtils.populateBoth(baseIsbn);
    dto.isbn10 = isbns.isbn10;
    dto.isbn13 = isbns.isbn13;

    // Publisher
    const publishingDetail = onix.PublishingDetail || {};
    dto.publisher =
      publishingDetail.Imprint?.ImprintName ||
      hanmoto.publisher ||
      hanmoto.hasshusha ||
      null;

    // Language
    if (descriptiveDetail.Language && descriptiveDetail.Language.length > 0) {
      const langCode = descriptiveDetail.Language[0].LanguageCode;
      dto.language = this.mapLanguageCode(langCode);
    }

    // Publication Year
    const pubDate =
      publishingDetail.PublishingDate?.[0]?.Date || hanmoto.dateshuppan;
    if (pubDate) {
      const yearMatch = pubDate.toString().match(/\d{4}/);
      dto.publicationYear = yearMatch ? parseInt(yearMatch[0], 10) : null;
    }

    // Pages
    const extent = descriptiveDetail.Extent || [];
    const pageExtent = extent.find((e) => e.ExtentUnit === '03');
    dto.pages = pageExtent ? parseInt(pageExtent.ExtentValue, 10) : null;

    // Synopsis
    const collateralDetail = onix.CollateralDetail || {};
    const textContent = collateralDetail.TextContent || [];
    const synopsisContent = textContent.find((t) => t.TextType === '03');
    dto.synopsis = synopsisContent?.Text || hanmoto.kaisetsu || null;

    // Cover
    dto.coverUrl = hanmoto.cover || null;

    // Subjects
    const subjects = descriptiveDetail.Subject || [];
    dto.subjects = subjects
      .map((s) => s.SubjectHeadingText)
      .filter((s): s is string => !!s);

    return dto;
  }

  private mapLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      jpn: 'Japonês',
      eng: 'Inglês',
      por: 'Português',
      spa: 'Espanhol',
      fre: 'Francês',
      fra: 'Francês',
      ger: 'Alemão',
      deu: 'Alemão',
      ita: 'Italiano',
    };
    return mapping[code.toLowerCase()] || code;
  }
}

interface OpenBDResponseItem {
  onix?: {
    DescriptiveDetail?: {
      TitleDetail?: {
        TitleElement?: {
          TitleText?: string;
          Subtitle?: string;
        };
      };
      Language?: Array<{
        LanguageCode: string;
      }>;
      Extent?: Array<{
        ExtentUnit: string;
        ExtentValue: string;
      }>;
      Subject?: Array<{
        SubjectHeadingText: string;
      }>;
    };
    RecordReference?: string;
    PublishingDetail?: {
      Imprint?: {
        ImprintName: string;
      };
      PublishingDate?: Array<{
        Date: string;
      }>;
    };
    CollateralDetail?: {
      TextContent?: Array<{
        TextType: string;
        Text: string;
      }>;
    };
  };
  hanmoto?: {
    publisher?: string;
    hasshusha?: string;
    dateshuppan?: string;
    kaisetsu?: string;
    cover?: string;
  };
}
