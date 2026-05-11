

// deps

    // externals
    import React from "react";
    import {
        Alert,
        Card, CardHeader, CardBody
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
        "onLoadError": (err: Error) => void;
        "user": string;
    }

    interface iState {
        "loading": boolean;
        "repositories": tRepository[];
    }

// component

export default class Repositories extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "Repositories";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "loading": true,
            "repositories": []
        };

    }

    public componentDidMount (): void {

        return this._loadRepositories();

    }

    public componentDidUpdate (prevProps: iProps): void {

        if (prevProps.user !== this.props.user) {

            this._loadRepositories();

        }

    }

    // private

    private _loadRepositories (): void {

        this.setState({
            "loading": true
        });

        this._sdk.getRepositoriesByUser({
            "path": {
                "user": this.props.user
            }
        }).then((repositories): void => {

            this.setState({
                "loading": false,
                "repositories": repositories
            });

        }).catch((err: Error): void => {

            this.setState({
                "loading": false
            });

            this.props.onLoadError(err);

        });

    }

    // render

    public render (): React.JSX.Element {

        if (this.state.loading) {
            return <Alert variant="warning">Loading repositories...</Alert>;
        }

        if (0 === this.state.repositories.length) {
            return <Alert variant="warning">No repositories found</Alert>;
        }

        return <Card>

            <CardHeader>{ this.props.user } repositories</CardHeader>

            <CardBody>

                { JSON.stringify(this.state.repositories) }

            </CardBody>

        </Card>;

    }

}
