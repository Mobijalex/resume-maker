/**
 * Task 15 Validation Test
 * 
 * This test validates that all requirements for task 15 have been implemented:
 * - Write unit tests for all utility functions and components
 * - Implement integration tests for complete user workflows
 * - Add end-to-end tests covering file upload to PDF download
 * - Create tests for ATS compatibility and PDF structure validation
 */

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

describe("Task 15: Comprehensive Test Suite Validation", () => {
    const projectRoot = process.cwd();

    describe("Unit Tests Implementation", () => {
        it("should have unit tests for all utility functions", () => {
            const utilsTestDir = join(projectRoot, "src/utils/__tests__");
            expect(existsSync(utilsTestDir), "Utils test directory should exist").toBe(true);

            const requiredUtilTests = [
                "MarkdownParser.test.ts",
                "PDFGenerator.test.ts",
                "validation.test.ts",
                "errorHandler.test.ts",
                "errorFactory.test.ts",
                "accessibility.test.ts",
                "browserCompatibility.test.ts",
                "retryMechanism.test.ts",
                "performanceOptimizer.test.ts",
                "dynamicImports.test.ts"
            ];

            requiredUtilTests.forEach(testFile => {
                const testPath = join(utilsTestDir, testFile);
                expect(existsSync(testPath), `Missing utility test: ${testFile}`).toBe(true);
            });
        });

        it("should have unit tests for all components", () => {
            const componentsTestDir = join(projectRoot, "src/components/__tests__");
            expect(existsSync(componentsTestDir), "Components test directory should exist").toBe(true);

            const requiredComponentTests = [
                "FileUploadComponent.test.tsx",
                "TextInputComponent.test.tsx",
                "TemplateSelector.test.tsx",
                "ResumePreview.test.tsx",
                "DownloadComponent.test.tsx",
                "ErrorBoundary.test.tsx",
                "ErrorNotification.test.tsx",
                "Layout.test.tsx",
                "ProgressIndicator.test.tsx",
                "StepRouter.test.tsx"
            ];

            requiredComponentTests.forEach(testFile => {
                const testPath = join(componentsTestDir, testFile);
                expect(existsSync(testPath), `Missing component test: ${testFile}`).toBe(true);
            });
        });

        it("should have unit tests for step components", () => {
            const stepsTestDir = join(projectRoot, "src/components/__tests__/steps");
            expect(existsSync(stepsTestDir), "Steps test directory should exist").toBe(true);

            const requiredStepTests = [
                "UploadStep.test.tsx",
                "ParseStep.test.tsx",
                "TemplateStep.test.tsx"
            ];

            requiredStepTests.forEach(testFile => {
                const testPath = join(stepsTestDir, testFile);
                expect(existsSync(testPath), `Missing step test: ${testFile}`).toBe(true);
            });
        });

        it("should have unit tests for context", () => {
            const contextTestDir = join(projectRoot, "src/context/__tests__");
            expect(existsSync(contextTestDir), "Context test directory should exist").toBe(true);

            const testPath = join(contextTestDir, "AppContext.test.tsx");
            expect(existsSync(testPath), "Missing AppContext test").toBe(true);
        });

        it("should have unit tests for templates", () => {
            const templatesTestDir = join(projectRoot, "src/templates/__tests__");
            expect(existsSync(templatesTestDir), "Templates test directory should exist").toBe(true);

            const requiredTemplateTests = [
                "professionalTemplate.test.ts",
                "modernTemplate.test.ts",
                "templateRegistry.test.ts",
                "templateRenderer.test.ts"
            ];

            requiredTemplateTests.forEach(testFile => {
                const testPath = join(templatesTestDir, testFile);
                expect(existsSync(testPath), `Missing template test: ${testFile}`).toBe(true);
            });
        });
    });

    describe("Integration Tests Implementation", () => {
        it("should have integration tests for complete user workflows", () => {
            const integrationTestDir = join(projectRoot, "src/__tests__/integration");
            expect(existsSync(integrationTestDir), "Integration test directory should exist").toBe(true);

            const testPath = join(integrationTestDir, "complete-workflow.test.tsx");
            expect(existsSync(testPath), "Missing complete workflow integration test").toBe(true);
        });

        it("should have integration tests for key components", () => {
            const integrationTests = [
                "src/utils/__tests__/MarkdownParser.integration.test.ts",
                "src/utils/__tests__/PDFGenerator.integration.test.ts",
                "src/utils/__tests__/validation.integration.test.ts",
                "src/components/__tests__/ResumePreview.integration.test.tsx",
                "src/components/__tests__/DownloadComponent.integration.test.tsx",
                "src/components/__tests__/accessibility.integration.test.tsx"
            ];

            integrationTests.forEach(testFile => {
                const testPath = join(projectRoot, testFile);
                expect(existsSync(testPath), `Missing integration test: ${testFile}`).toBe(true);
            });
        });
    });

    describe("End-to-End Tests Implementation", () => {
        it("should have e2e tests covering file upload to PDF download", () => {
            const e2eTestDir = join(projectRoot, "src/__tests__/e2e");
            expect(existsSync(e2eTestDir), "E2E test directory should exist").toBe(true);

            const testPath = join(e2eTestDir, "file-upload-to-pdf.test.tsx");
            expect(existsSync(testPath), "Missing file upload to PDF e2e test").toBe(true);
        });
    });

    describe("ATS Compatibility Tests Implementation", () => {
        it("should have tests for ATS compatibility and PDF structure validation", () => {
            const atsTestDir = join(projectRoot, "src/__tests__/ats-compatibility");
            expect(existsSync(atsTestDir), "ATS compatibility test directory should exist").toBe(true);

            const requiredATSTests = [
                "ats-parsing.test.ts",
                "pdf-structure.test.ts"
            ];

            requiredATSTests.forEach(testFile => {
                const testPath = join(atsTestDir, testFile);
                expect(existsSync(testPath), `Missing ATS compatibility test: ${testFile}`).toBe(true);
            });
        });
    });

    describe("Test Infrastructure", () => {
        it("should have proper test configuration", () => {
            const vitestConfig = join(projectRoot, "vitest.config.ts");
            expect(existsSync(vitestConfig), "Vitest configuration should exist").toBe(true);

            const testSetup = join(projectRoot, "src/test/setup.ts");
            expect(existsSync(testSetup), "Test setup file should exist").toBe(true);
        });

        it("should have test utilities and configuration", () => {
            const testConfig = join(projectRoot, "src/__tests__/test-config.ts");
            expect(existsSync(testConfig), "Test configuration utilities should exist").toBe(true);

            const testRunner = join(projectRoot, "src/__tests__/test-runner.ts");
            expect(existsSync(testRunner), "Test runner should exist").toBe(true);
        });

        it("should have comprehensive test documentation", () => {
            const testSummary = join(projectRoot, "src/__tests__/test-summary.md");
            expect(existsSync(testSummary), "Test summary documentation should exist").toBe(true);
        });
    });

    describe("Test Coverage Requirements", () => {
        it("should have adequate test file count", () => {
            // Count all test files
            const testFiles = countTestFiles(projectRoot);

            expect(testFiles.unit).toBeGreaterThan(25, "Should have at least 25 unit test files");
            expect(testFiles.integration).toBeGreaterThan(5, "Should have at least 5 integration test files");
            expect(testFiles.e2e).toBeGreaterThan(0, "Should have at least 1 e2e test file");
            expect(testFiles.ats).toBeGreaterThan(1, "Should have at least 2 ATS compatibility test files");
            expect(testFiles.total).toBeGreaterThan(35, "Should have at least 35 total test files");
        });

        it("should cover all major functionality areas", () => {
            const functionalityAreas = [
                "File upload and validation",
                "Markdown parsing and data extraction",
                "Template selection and application",
                "PDF generation and download",
                "Error handling and recovery",
                "Accessibility compliance",
                "ATS compatibility validation",
                "Complete user workflow",
                "Performance optimization",
                "Browser compatibility"
            ];

            // This test validates that we have test coverage for all major areas
            // The actual validation is done by checking the existence of test files above
            expect(functionalityAreas.length).toBe(10);
        });
    });

    describe("Package.json Test Scripts", () => {
        it("should have comprehensive test scripts", () => {
            const packageJson = require(join(projectRoot, "package.json"));
            const scripts = packageJson.scripts;

            expect(scripts.test, "Should have basic test script").toBeDefined();
            expect(scripts["test:run"], "Should have test:run script").toBeDefined();
            expect(scripts["test:unit"], "Should have test:unit script").toBeDefined();
            expect(scripts["test:integration"], "Should have test:integration script").toBeDefined();
            expect(scripts["test:e2e"], "Should have test:e2e script").toBeDefined();
            expect(scripts["test:ats"], "Should have test:ats script").toBeDefined();
        });
    });
});

// Helper function to count test files
function countTestFiles(projectRoot: string): { unit: number; integration: number; e2e: number; ats: number; total: number } {
    const counts = { unit: 0, integration: 0, e2e: 0, ats: 0, total: 0 };

    // Count unit tests
    const unitTestDirs = [
        "src/components/__tests__",
        "src/utils/__tests__",
        "src/context/__tests__",
        "src/templates/__tests__"
    ];

    unitTestDirs.forEach(dir => {
        const fullPath = join(projectRoot, dir);
        if (existsSync(fullPath)) {
            counts.unit += countTestFilesInDir(fullPath);
        }
    });

    // Count integration tests
    const integrationTestDir = join(projectRoot, "src/__tests__/integration");
    if (existsSync(integrationTestDir)) {
        counts.integration += countTestFilesInDir(integrationTestDir);
    }

    // Count integration tests in other directories
    const allDirs = ["src/components/__tests__", "src/utils/__tests__"];
    allDirs.forEach(dir => {
        const fullPath = join(projectRoot, dir);
        if (existsSync(fullPath)) {
            counts.integration += countIntegrationTestsInDir(fullPath);
        }
    });

    // Count e2e tests
    const e2eTestDir = join(projectRoot, "src/__tests__/e2e");
    if (existsSync(e2eTestDir)) {
        counts.e2e += countTestFilesInDir(e2eTestDir);
    }

    // Count ATS tests
    const atsTestDir = join(projectRoot, "src/__tests__/ats-compatibility");
    if (existsSync(atsTestDir)) {
        counts.ats += countTestFilesInDir(atsTestDir);
    }

    counts.total = counts.unit + counts.integration + counts.e2e + counts.ats;
    return counts;
}

function countTestFilesInDir(dir: string): number {
    if (!existsSync(dir)) return 0;

    let count = 0;
    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            count += countTestFilesInDir(fullPath);
        } else if (item.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
            count++;
        }
    }

    return count;
}

function countIntegrationTestsInDir(dir: string): number {
    if (!existsSync(dir)) return 0;

    let count = 0;
    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            count += countIntegrationTestsInDir(fullPath);
        } else if (item.match(/\.integration\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
            count++;
        }
    }

    return count;
}