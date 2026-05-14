

// deps

    // externals
    import React from "react";
    import {
        Card, CardBody, CardHeader,
        Select
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../sdk";
    import Repositories from "./Repositories";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "../sdk";
    import type { operations } from "../Descriptor";

// props & state

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "loading": boolean;
        "users": string[];
        "selected-user": string;
    }

// component

export default class ChooseUser extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "ChooseUser";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "loading": true,
            "users": [],
            "selected-user": ""
        };

    }

    public componentDidMount (): void {

        this._sdk.getUsers().then((users: operations["getUsers"]["responses"]["200"]["content"]["application/json"]): void => {

            this.setState({
                "users": users,
                "loading": false
            });

        }).catch((err: Error): void => {

            this.setState({ "loading": false });
            this.props.onError(err);

        });

    }

    // interface handlers

    private _handleChooseUser (e: React.ChangeEvent<HTMLSelectElement>, newValue: string): void {

        this.setState({
            "selected-user": newValue
        });

    }

    private _handleLoadRepositoriesError (err: Error): void {

        this.setState({
            "selected-user": ""
        });

        this.props.onError(err);

    }

    private _handleAnalyzeError (err: Error): void {

        this.props.onError(err);

    }

    // render

    private _renderUserSelector (): React.JSX.Element {

        return <Select label="Users" value={ this.state["selected-user"] } onChange={ this._handleChooseUser.bind(this) }>

            <option value="">-</option>

            { [ "Psychopoulet", "Malky-dev" ].map((user: string): React.JSX.Element => {

                return <option key={ user } value={ user }>{ user }</option>;

            }) }

        </Select>;

    }

    public render (): React.JSX.Element {

        if ("" === this.state["selected-user"].trim()) {

            return <div className="row justify-content-md-center mt-3">

                <div className="col-12 col-md-6">

                    <Card>

                        <CardHeader>Choose a user</CardHeader>

                        <CardBody>

                            { this.state.loading ? "Loading..." : this._renderUserSelector() }

                        </CardBody>

                    </Card>

                </div>

            </div>;

        }
        else {

            return <div className="row mt-3">

                <div className="col-12 col-md-6 col-lg-4 col-xl-3">

                    <Card>
                        <CardBody>
                            { this._renderUserSelector() }
                        </CardBody>
                    </Card>

                </div>

                <div className="col-12 col-md-6 col-lg-8 col-xl-9">

                    <Repositories
                        onLoadError={ this._handleLoadRepositoriesError.bind(this) }
                        onAnalyzeError={ this._handleAnalyzeError.bind(this) }
                        user={ this.state["selected-user"] }
                    />

                </div>

            </div>;

        }

    }

}
