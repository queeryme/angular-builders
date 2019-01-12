import { EnvironmentBuilderSchema } from './schema';
import { Builder, BuilderConfiguration, BuildEvent } from '@angular-devkit/architect';
import { Observable, of } from 'rxjs';
import * as ts from 'typescript';
import { CompilerOptions, Diagnostic, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';

// noinspection JSUnusedGlobalSymbols
export default class EnvironmentBuilder implements Builder<EnvironmentBuilderSchema> {

    run(builderConfig: BuilderConfiguration<Partial<EnvironmentBuilderSchema>>): Observable<BuildEvent> {
        require('dotenv').config();

        const { build } = builderConfig.options;

        const compilerOptions: CompilerOptions = {
            moduleResolution: ModuleResolutionKind.NodeJs,
            module: ModuleKind.CommonJS,
            target: ScriptTarget.ESNext,
            strict: true,
            allowSyntheticDefaultImports: true,
            suppressImplicitAnyIndexErrors: true,
            forceConsistentCasingInFileNames: true,
            strictPropertyInitialization: false,
            strictNullChecks: false,
            pretty: true,
            sourceMap: true,
            declaration: true,
            stripInternal: true,
            skipLibCheck: true,
            declarationDir: 'typings',
        };
        this.compile([build], compilerOptions);

        console.log('build is: ', build);
        const built = require(build);
        console.log('built', built);

        return of({ success: true });
    }

    /**
     * @see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
     * @param fileNames
     * @param options
     */
    compile(fileNames: string[], options: CompilerOptions): void {
        const program = ts.createProgram(fileNames, options);
        const emitResult = program.emit();

        const allDiagnostics = ts
            .getPreEmitDiagnostics(program)
            .concat(emitResult.diagnostics);

        allDiagnostics.forEach((diagnostic: Diagnostic) => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
                    diagnostic.start!,
                );
                const message = ts.flattenDiagnosticMessageText(
                    diagnostic.messageText,
                    '\n',
                );
                console.log(
                    `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
                );
            } else {
                console.log(
                    `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
                );
            }
        });

    }

}
