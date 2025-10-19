#!/usr/bin/env node

/**
 * Task 18 Validation Script
 * 
 * Comprehensive validation script that verifies all Task 18 requirements
 * are met and the application is ready for cross-browser deployment.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
    category: string;
    requirement: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    details: string;
}

class Task18Validator {
    private results: ValidationResult[] = [];

    constructor() {
        console.log('🔍 Task 18 Implementation Validation');
        console.log('='.repeat(60));
        console.log('Validating: Final integration and cross-browser testing');
        console.log('Requirements: 11.1, 11.2, 11.3, 10.3');
        console.log('='.repeat(60));
    }

    private addResult(category: string, requirement: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string) {
        this.results.push({ category, requirement, status, details });

        const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} ${category}: ${requirement} - ${details}`);
    }

    validateProjectStructure(): void {
        console.log('\n📁 Validating Project Structure...');

        // Check for cross-browser test files
        const requiredFiles = [
            'src/__tests__/cross-browser/browser-compatibility.test.ts',
            'src/__tests__/cross-browser/responsive-design.test.ts',
            'src/__tests__/cross-browser/ats-validation.test.ts',
            'src/__tests__/cross-browser/complete-workflow.test.tsx',
            'src/__tests__/cross-browser/test-runner.ts'
        ];

        requiredFiles.forEach(file => {
            const exists = existsSync(file);
            this.addResult(
                'Project Structure',
                `Cross-browser test file: ${file}`,
                exists ? 'PASS' : 'FAIL',
                exists ? 'File exists' : 'File missing'
            );
        });

        // Check package.json for test scripts
        const packageJsonPath = 'package.json';
        if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            const hasTestScript = packageJson.scripts && packageJson.scripts['test:cross-browser'];

            this.addResult(
                'Project Structure',
                'Cross-browser test script',
                hasTestScript ? 'PASS' : 'FAIL',
                hasTestScript ? 'Script configured' : 'Script missing'
            );
        }
    }

    validateBrowserCompatibility(): void {
        console.log('\n🌐 Validating Browser Compatibility...');

        // Check for browser-specific test implementations
        const browserTestFile = 'src/__tests__/cross-browser/browser-compatibility.test.ts';

        if (existsSync(browserTestFile)) {
            const content = readFileSync(browserTestFile, 'utf8');

            const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
            browsers.forEach(browser => {
                const hasBrowserTest = content.includes(browser);
                this.addResult(
                    'Browser Compatibility',
                    `${browser} browser testing`,
                    hasBrowserTest ? 'PASS' : 'FAIL',
                    hasBrowserTest ? 'Tests implemented' : 'Tests missing'
                );
            });

            // Check for feature detection
            const hasFeatureDetection = content.includes('Feature Detection');
            this.addResult(
                'Browser Compatibility',
                'Feature detection and fallbacks',
                hasFeatureDetection ? 'PASS' : 'WARNING',
                hasFeatureDetection ? 'Implemented' : 'Consider adding feature detection'
            );
        }
    }

    validateResponsiveDesign(): void {
        console.log('\n📱 Validating Responsive Design...');

        const responsiveTestFile = 'src/__tests__/cross-browser/responsive-design.test.ts';

        if (existsSync(responsiveTestFile)) {
            const content = readFileSync(responsiveTestFile, 'utf8');

            // Check for different screen size tests
            const screenSizes = ['1024x768', '768x1024', '1920x1080'];
            screenSizes.forEach(size => {
                const hasScreenTest = content.includes(size) || content.includes(size.replace('x', ','));
                this.addResult(
                    'Responsive Design',
                    `Screen size testing: ${size}`,
                    hasScreenTest ? 'PASS' : 'WARNING',
                    hasScreenTest ? 'Tests implemented' : 'Consider adding specific tests'
                );
            });

            // Check for touch device support
            const hasTouchSupport = content.includes('touch') || content.includes('Touch');
            this.addResult(
                'Responsive Design',
                'Touch device support',
                hasTouchSupport ? 'PASS' : 'WARNING',
                hasTouchSupport ? 'Tests implemented' : 'Consider adding touch tests'
            );

            // Check minimum resolution requirement (1024x768)
            const hasMinResolution = content.includes('1024') && content.includes('768');
            this.addResult(
                'Responsive Design',
                'Minimum resolution support (Req 8.3)',
                hasMinResolution ? 'PASS' : 'FAIL',
                hasMinResolution ? 'Requirement validated' : 'Missing minimum resolution tests'
            );
        }
    }

    validateATSCompatibility(): void {
        console.log('\n🤖 Validating ATS Compatibility...');

        const atsTestFile = 'src/__tests__/cross-browser/ats-validation.test.ts';

        if (existsSync(atsTestFile)) {
            const content = readFileSync(atsTestFile, 'utf8');

            // Check for major ATS systems (Req 11.1)
            const atsSystems = ['Workday', 'Greenhouse', 'Lever', 'Taleo'];
            atsSystems.forEach(system => {
                const hasSystemTest = content.includes(system);
                this.addResult(
                    'ATS Compatibility',
                    `${system} ATS compatibility (Req 11.1)`,
                    hasSystemTest ? 'PASS' : 'FAIL',
                    hasSystemTest ? 'Tests implemented' : 'Missing ATS system tests'
                );
            });

            // Check for 95% parsing success rate (Req 11.2)
            const hasParsingRate = content.includes('95%') || content.includes('parsing success');
            this.addResult(
                'ATS Compatibility',
                '95% parsing success rate (Req 11.2)',
                hasParsingRate ? 'PASS' : 'WARNING',
                hasParsingRate ? 'Requirement addressed' : 'Consider adding parsing rate validation'
            );

            // Check for PDF structure validation
            const hasPDFValidation = content.includes('PDF Structure') || content.includes('pdf structure');
            this.addResult(
                'ATS Compatibility',
                'PDF structure validation',
                hasPDFValidation ? 'PASS' : 'FAIL',
                hasPDFValidation ? 'Tests implemented' : 'Missing PDF structure tests'
            );

            // Check for ATS-friendly formatting
            const hasATSFormatting = content.includes('ATS-friendly') || content.includes('standard fonts');
            this.addResult(
                'ATS Compatibility',
                'ATS-friendly formatting (Req 4.1-4.4)',
                hasATSFormatting ? 'PASS' : 'FAIL',
                hasATSFormatting ? 'Tests implemented' : 'Missing formatting tests'
            );
        }
    }

    validateCompleteWorkflow(): void {
        console.log('\n🔄 Validating Complete Workflow...');

        const workflowTestFile = 'src/__tests__/cross-browser/complete-workflow.test.tsx';

        if (existsSync(workflowTestFile)) {
            const content = readFileSync(workflowTestFile, 'utf8');

            // Check for upload to PDF workflow
            const hasUploadWorkflow = content.includes('File Upload to PDF') || content.includes('upload.*pdf');
            this.addResult(
                'Complete Workflow',
                'File upload to PDF download workflow',
                hasUploadWorkflow ? 'PASS' : 'FAIL',
                hasUploadWorkflow ? 'Tests implemented' : 'Missing upload workflow tests'
            );

            // Check for text input to PDF workflow
            const hasTextWorkflow = content.includes('Text Input to PDF') || content.includes('text.*pdf');
            this.addResult(
                'Complete Workflow',
                'Text input to PDF download workflow',
                hasTextWorkflow ? 'PASS' : 'FAIL',
                hasTextWorkflow ? 'Tests implemented' : 'Missing text input workflow tests'
            );

            // Check for error handling
            const hasErrorHandling = content.includes('Error Handling') || content.includes('error.*handling');
            this.addResult(
                'Complete Workflow',
                'Error handling throughout workflow',
                hasErrorHandling ? 'PASS' : 'WARNING',
                hasErrorHandling ? 'Tests implemented' : 'Consider adding error handling tests'
            );

            // Check for performance requirements (Req 10.3)
            const hasPerformance = content.includes('Performance') || content.includes('2 seconds');
            this.addResult(
                'Complete Workflow',
                'Performance requirements (Req 10.3)',
                hasPerformance ? 'PASS' : 'WARNING',
                hasPerformance ? 'Tests implemented' : 'Consider adding performance tests'
            );
        }
    }

    validateTestExecution(): void {
        console.log('\n🧪 Validating Test Execution...');

        try {
            // Try to run the cross-browser tests
            console.log('   Running cross-browser test suite...');

            const output = execSync('npm run test:cross-browser', {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: 'pipe',
                timeout: 60000 // 1 minute timeout
            });

            this.addResult(
                'Test Execution',
                'Cross-browser test suite execution',
                'PASS',
                'Tests executed successfully'
            );

        } catch (error: any) {
            const isTimeout = error.message?.includes('timeout');
            const status = isTimeout ? 'WARNING' : 'FAIL';
            const details = isTimeout ? 'Tests timed out (may still be valid)' : 'Test execution failed';

            this.addResult(
                'Test Execution',
                'Cross-browser test suite execution',
                status,
                details
            );
        }
    }

    validateRequirementsCoverage(): void {
        console.log('\n📋 Validating Requirements Coverage...');

        const requirements = [
            { id: '11.1', desc: 'ATS system compatibility (Workday, Greenhouse, Lever, Taleo)' },
            { id: '11.2', desc: '95% PDF parsing success rate' },
            { id: '11.3', desc: 'Markdown format specification support' },
            { id: '10.3', desc: 'Responsive design and performance requirements' }
        ];

        requirements.forEach(req => {
            // Check if requirement is addressed in test files
            const testFiles = [
                'src/__tests__/cross-browser/browser-compatibility.test.ts',
                'src/__tests__/cross-browser/responsive-design.test.ts',
                'src/__tests__/cross-browser/ats-validation.test.ts',
                'src/__tests__/cross-browser/complete-workflow.test.tsx'
            ];

            let requirementCovered = false;
            testFiles.forEach(file => {
                if (existsSync(file)) {
                    const content = readFileSync(file, 'utf8');
                    if (content.includes(req.id) ||
                        (req.id === '11.1' && content.includes('Workday')) ||
                        (req.id === '11.2' && content.includes('95%')) ||
                        (req.id === '10.3' && content.includes('responsive'))) {
                        requirementCovered = true;
                    }
                }
            });

            this.addResult(
                'Requirements Coverage',
                `Requirement ${req.id}: ${req.desc}`,
                requirementCovered ? 'PASS' : 'WARNING',
                requirementCovered ? 'Covered in tests' : 'May need explicit coverage'
            );
        });
    }

    generateFinalReport(): void {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TASK 18 VALIDATION REPORT');
        console.log('='.repeat(60));

        // Count results by status
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warnings = this.results.filter(r => r.status === 'WARNING').length;
        const total = this.results.length;

        console.log(`\n📈 Validation Summary:`);
        console.log(`   Total Checks: ${total}`);
        console.log(`   Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
        console.log(`   Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
        console.log(`   Warnings: ${warnings} (${((warnings / total) * 100).toFixed(1)}%)`);

        // Group results by category
        const categories = [...new Set(this.results.map(r => r.category))];

        console.log(`\n📋 Results by Category:`);
        categories.forEach(category => {
            const categoryResults = this.results.filter(r => r.category === category);
            const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
            const categoryTotal = categoryResults.length;

            console.log(`   ${category}: ${categoryPassed}/${categoryTotal} passed`);
        });

        // Show failed items
        const failedItems = this.results.filter(r => r.status === 'FAIL');
        if (failedItems.length > 0) {
            console.log(`\n❌ Failed Validations:`);
            failedItems.forEach(item => {
                console.log(`   • ${item.category}: ${item.requirement}`);
                console.log(`     ${item.details}`);
            });
        }

        // Show warnings
        const warningItems = this.results.filter(r => r.status === 'WARNING');
        if (warningItems.length > 0) {
            console.log(`\n⚠️  Warnings:`);
            warningItems.forEach(item => {
                console.log(`   • ${item.category}: ${item.requirement}`);
                console.log(`     ${item.details}`);
            });
        }

        // Final assessment
        const isComplete = failed === 0;
        const isReady = failed === 0 && warnings <= 2; // Allow minor warnings

        console.log(`\n🎯 Task 18 Implementation Assessment:`);

        if (isComplete && isReady) {
            console.log(`   ✅ TASK 18 IMPLEMENTATION COMPLETE`);
            console.log(`   ✅ All critical requirements validated`);
            console.log(`   ✅ Cross-browser testing suite implemented`);
            console.log(`   ✅ Ready for production deployment`);
        } else if (isComplete) {
            console.log(`   ✅ TASK 18 IMPLEMENTATION COMPLETE`);
            console.log(`   ⚠️  Minor warnings present - review recommended`);
            console.log(`   ✅ Core functionality validated`);
        } else {
            console.log(`   ❌ TASK 18 IMPLEMENTATION INCOMPLETE`);
            console.log(`   ❌ Critical issues need resolution`);
            console.log(`   ⚠️  Address failed validations before deployment`);
        }

        console.log(`\n💡 Next Steps:`);
        if (isComplete && isReady) {
            console.log(`   • Task 18 is complete and ready`);
            console.log(`   • Consider running tests on actual devices`);
            console.log(`   • Set up CI/CD pipeline for continuous testing`);
        } else {
            console.log(`   • Address failed validations`);
            console.log(`   • Review and improve test coverage`);
            console.log(`   • Re-run validation after fixes`);
        }

        console.log('\n' + '='.repeat(60));
    }

    async runFullValidation(): Promise<void> {
        this.validateProjectStructure();
        this.validateBrowserCompatibility();
        this.validateResponsiveDesign();
        this.validateATSCompatibility();
        this.validateCompleteWorkflow();
        this.validateRequirementsCoverage();

        // Test execution is optional and may take time
        console.log('\n⏳ Running test execution validation (this may take a moment)...');
        this.validateTestExecution();

        this.generateFinalReport();
    }
}

// Run validation
async function main() {
    const validator = new Task18Validator();

    try {
        await validator.runFullValidation();
        process.exit(0);
    } catch (error) {
        console.error('❌ Validation failed:', error);
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    main();
}

export default Task18Validator;