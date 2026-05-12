

// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardList, CardFooter,
        ListItem,
        Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../sdk";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK, tRepository } from "../sdk";

// props & state

    interface iProps extends iPropsNode {
        "onAnalyzeError": (err: Error) => void;
        "repository": tRepository;
    }

    interface iState {
        "analyzing": boolean;
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
            "analyzing": false
        };

    }

    // interface handlers

    private _handleAnalyze (e: React.MouseEvent<HTMLButtonElement>): void {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "analyzing": true
        });

        this._sdk.analyzePackage(this.props.repository.package_url).then((content): void => {

            console.log("analyze package", content);

            this.setState({
                "analyzing": false
            });

        }).catch((err: Error): void => {

            this.setState({
                "analyzing": false
            });

            this.props.onAnalyzeError(err);

        });

    }

    // render

    public render (): React.JSX.Element {

        return <Card variant={ this.props.repository.archived ? "danger" : null }>

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
                    onClick={ this._handleAnalyze.bind(this) }
                >
                    Analyze
                </Button>

            </CardFooter>

        </Card>;

    }

}
