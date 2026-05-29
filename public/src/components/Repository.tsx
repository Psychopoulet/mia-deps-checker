// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardList, CardFooter,
        Modal, ModalList,
        ListItem,
        Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK, tRepository } from "../SDK";
    import type { components } from "../Descriptor";

// props & state

    interface iProps extends iPropsNode {
        "onAnalyzeError": (err: Error) => void;
        "repository": tRepository;
    }

    interface iState {
        "analyzing": boolean;
        "analyzed": boolean;
        "analyzeNodeEngineResult": components["schemas"]["AnalyzeNodeEngineResult"];
        "analyzeDependenciesResult": components["schemas"]["AnalyzeDependenciesResult"];
    }

// component

export default class Repository extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "Repository";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = this._resetState();

    }

    // private

    private readonly _resetState = (): iState => {

        return {
            "analyzing": false,
            "analyzed": false,
            "analyzeNodeEngineResult": {
                "result": false,
                "message": ""
            },
            "analyzeDependenciesResult": {
                "result": false,
                "results": []
            }
        };

    };

    // interface handlers

    private readonly _handleAnalyze = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        if (this.props.repository.archived) {
            this.props.onAnalyzeError(new Error("Repository is archived"));
            return;
        }

        this.setState({
            ...this._resetState(),
            "analyzing": true,
            "analyzed": false
        });

        this._sdk.analyzePackageNodeEngine(this.props.repository.package_url).then((analyzeNodeEngineResult: components["schemas"]["AnalyzeNodeEngineResult"]): Promise<void> => {

            return this._sdk.analyzePackageDependencies(this.props.repository.package_url).then((analyzeDependenciesResult: components["schemas"]["AnalyzeDependenciesResult"]): void => {

                this.setState({
                    "analyzing": false,
                    "analyzed": true,
                    "analyzeNodeEngineResult": analyzeNodeEngineResult,
                    "analyzeDependenciesResult": analyzeDependenciesResult
                });

            });

        }).catch((err: Error): void => {

            this.setState(this._resetState());

            this.props.onAnalyzeError(err);

        });

    };

    private readonly _handleCloseAnalyzeResult = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState(this._resetState());

    };

    // render

    public render (): React.JSX.Element {

        let result: "danger" | "warning" | "success" = "success";

        if (this.state.analyzeNodeEngineResult.result && this.state.analyzeDependenciesResult.result) {
            result = "success";
        }
        else if (!this.state.analyzeNodeEngineResult.result && !this.state.analyzeDependenciesResult.result) {
            result = "danger";
        }
        else {
            result = "warning";
        }

        return <>

            { this.state.analyzed && <Modal appId="{{plugin.name}}-app" title={ "Analyze of " + this.props.repository.name }
                variant={ result } centered size="lg" scrollable
                onClose={ this._handleCloseAnalyzeResult }>

                    <ModalList>

                        <ListItem variant={ this.state.analyzeNodeEngineResult.result ? "success" : "danger" }>
                            { this.state.analyzeNodeEngineResult.message }
                        </ListItem>

                    </ModalList>

                    <ModalList>

                        { this.state.analyzeDependenciesResult.results.map((analyzeDependenciesResult): React.JSX.Element => {

                            let variant: "warning" | "danger" | "info" | "secondary" | null = null;
                            let className: string | null = null;

                            if ("warning" === analyzeDependenciesResult.result) {
                                variant = "secondary";
                            }
                            else if ("fail_major" === analyzeDependenciesResult.result) {
                                variant = "danger";
                            }
                            else if ("fail_minor" === analyzeDependenciesResult.result) {
                                className = "text-danger";
                            }
                            else if ("fail_patch" === analyzeDependenciesResult.result) {
                                variant = "warning";
                            }
                            else {
                                variant = null;
                            }

                            return <ListItem key={ analyzeDependenciesResult.name } className={ className ?? undefined } variant={ variant ?? undefined } justify>
                                { analyzeDependenciesResult.name } { "success" !== analyzeDependenciesResult.result && <span className="text-muted">{ analyzeDependenciesResult.message }</span> }
                            </ListItem>;

                        }) }

                    </ModalList>

            </Modal> }

            <Card variant={ this.props.repository.archived ? "danger" : null }>

                <CardHeader justify>

                    <span>
                        <a href={ this.props.repository.html_url } target="_blank" rel="noopener noreferrer">{ this.props.repository.name }</a>
                        { this.props.repository.archived && <span className="text-muted"> (archived)</span> }
                    </span>

                    { this.props.repository.language }

                </CardHeader>

                <CardList>

                    <ListItem variant={ 0 < this.props.repository.watchers_count ? "success" : null }>watchers: { this.props.repository.watchers_count }</ListItem>
                    <ListItem variant={ 0 < this.props.repository.open_issues_count ? "danger" : null }>issues: { this.props.repository.open_issues_count }</ListItem>

                </CardList>

                <CardFooter>

                    <Button icon="cog" block
                        title="Analyze"
                        disabled={ this.props.repository.archived || this.state.analyzing }
                        onClick={ this._handleAnalyze }
                    >
                        Analyze
                    </Button>

                </CardFooter>

            </Card>

        </>;

    }

}
