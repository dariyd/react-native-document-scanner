package com.docscanner;

import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions;

final class ScannerConfig {
    static final int DEFAULT_PAGE_LIMIT = 10;
    static final int DEFAULT_SCANNER_MODE = GmsDocumentScannerOptions.SCANNER_MODE_FULL;
    static final boolean DEFAULT_GALLERY_IMPORT_ALLOWED = false;

    final int pageLimit;
    final int scannerMode;
    final boolean galleryImportAllowed;

    private ScannerConfig(int pageLimit, int scannerMode, boolean galleryImportAllowed) {
        this.pageLimit = pageLimit;
        this.scannerMode = scannerMode;
        this.galleryImportAllowed = galleryImportAllowed;
    }

    static ScannerConfig from(Double maxNumDocuments, String scannerMode, Boolean galleryImportAllowed) {
        int pageLimit = maxNumDocuments == null
                ? DEFAULT_PAGE_LIMIT
                : parsePageLimit(maxNumDocuments);

        return new ScannerConfig(
                pageLimit,
                mapScannerMode(scannerMode),
                galleryImportAllowed == null
                        ? DEFAULT_GALLERY_IMPORT_ALLOWED
                        : galleryImportAllowed
        );
    }

    private static int parsePageLimit(double pageLimit) {
        if (Double.isNaN(pageLimit)
                || Double.isInfinite(pageLimit)
                || pageLimit < 1
                || pageLimit > Integer.MAX_VALUE
                || pageLimit != Math.rint(pageLimit)) {
            throw new IllegalArgumentException("maxNumDocuments must be an integer greater than or equal to 1");
        }
        return (int) pageLimit;
    }

    private static int mapScannerMode(String scannerMode) {
        if (scannerMode == null) {
            return DEFAULT_SCANNER_MODE;
        }

        switch (scannerMode) {
            case "base":
                return GmsDocumentScannerOptions.SCANNER_MODE_BASE;
            case "base-with-filter":
                return GmsDocumentScannerOptions.SCANNER_MODE_BASE_WITH_FILTER;
            case "full":
                return GmsDocumentScannerOptions.SCANNER_MODE_FULL;
            default:
                throw new IllegalArgumentException(
                        "scannerMode must be one of: base, base-with-filter, full"
                );
        }
    }
}
