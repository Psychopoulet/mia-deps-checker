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
        "analyzeResult": components["schemas"]["Analyze"] | null;
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

        this.state = {
            "analyzing": false,
            "analyzeResult": null
        };

    }

    // interface handlers

    private readonly _handleAnalyze = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "analyzing": true
        });

        this._sdk.analyzePackage(this.props.repository.package_url).then((content: components["schemas"]["Analyze"]): void => {

            this.setState({
                "analyzing": false,
                "analyzeResult": content
            });

        }).catch((err: Error): void => {

            this.setState({
                "analyzing": false
            });

            this.props.onAnalyzeError(err);

        });

    };

    private readonly _handleCloseAnalyzeResult = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "analyzeResult": null
        });

    };

    // render

    public render (): React.JSX.Element {

        return <>

            { this.state.analyzeResult && <Modal appId="{{plugin.name}}-app" title={ "Analyze of " + this.props.repository.name }
                variant={ this.state.analyzeResult.result ? "success" : "warning" } centered size="lg" scrollable
                onClose={ this._handleCloseAnalyzeResult }>

                    <ModalList>

                        { this.state.analyzeResult.results.map((result): React.JSX.Element => {

                            let variant: "warning" | "danger" | "info" | "secondary" | null = null;
                            let className: string | null = null;

                            if ("warning" === result.result) {
                                variant = "secondary";
                            }
                            else if ("fail_major" === result.result) {
                                variant = "danger";
                            }
                            else if ("fail_minor" === result.result) {
                                className = "text-danger";
                            }
                            else if ("fail_patch" === result.result) {
                                variant = "warning";
                            }
                            else {
                                variant = null;
                            }

                            return <ListItem key={ result.name } className={ className ?? undefined } variant={ variant ?? undefined } justify>
                                { result.name } { "success" !== result.result && <span className="text-muted">{ result.message }</span> }
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
                        onClick={ this._handleAnalyze }
                    >
                        Analyze
                    </Button>

                </CardFooter>

            </Card>

        </>;

    }

}
