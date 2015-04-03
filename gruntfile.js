module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            dev: {
                src: ["source/walt.ts"],
                outDir: 'build/',
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: false,
                    declaration: false,
                    removeComments: false,
                    noImplicitAny: false
                }
            },

            prod: {
                src: ["source/walt.ts"],
                outDir: 'build/',
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: false,
                    declaration: false,
                    removeComments: false,
                    noImplicitAny: false,
                    fast: 'never' // disable fast compile
                }
            }
        },

        uglify: {
            options: {
                mangle: true,
                preserveComments: 'some'
            },
            walt: {
                files: {
                    'build/walt.min.js': ['build/walt.js']
                }
            }
        },

        tslint: {
            options: {
                configuration: {
                    'rules': {
                        'class-name': false, //PascalCase
                        'curly': true,
                        'eofline': true,
                        'forin': true,
                        'indent': [true, 4],
                        'label-position': true,
                        'label-undefined': true,
                        'max-line-length': [false, 140],
                        'no-arg': true,
                        'no-bitwise': true,
                        'no-console': [true,
                            'debug',
                            'info',
                            'time',
                            'timeEnd',
                            'trace'
                        ],
                        'no-construct': true,
                        'no-debugger': true,
                        'no-duplicate-key': true,
                        'no-duplicate-variable': true,
                        'no-empty': true,
                        'no-eval': true,
                        'use-strict': true, // dont think this actually works
                        'no-string-literal': false, // lets us do window['whateva'] (since we cant do window.whateva)
                        'no-trailing-whitespace': true,
                        'no-unreachable': true,
                        'one-line': [false //,
                            // 'check-open-brace',
                            // 'check-catch',
                            // 'check-else'
                            // 'check-whitespace'
                        ],
                        'quotemark': [true, 'single'],
                        'radix': true,
                        'semicolon': true,
                        'triple-equals': [true, 'allow-null-check'],
                        'variable-name': false,
                        'whitespace': [false
                            // 'check-branch',
                            // 'check-decl',
                            // 'check-operator',
                            // 'check-separator',
                            // 'check-type'
                        ]
                    }
                }
            },
            files: {
                src: ['source/**/*.ts']
            }
        },

        watch: {
            js: {
                files: ['source/**/*.ts'],
                tasks: ['ts:dev', 'ts:prod']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-tslint');


    grunt.registerTask('dev', ['ts:dev', 'watch:js']);
    grunt.registerTask('build', ['ts:prod', 'uglify']);
};
