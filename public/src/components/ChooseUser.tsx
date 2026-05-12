

// deps

    // externals
    import React from "react";
    import {
        Card, CardBody, CardHeader,
        Select
    } from "react-bootstrap-fontawesome";

    // locals
    import Repositories from "./Repositories";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

// props & state

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "user": string;
    }

// component

export default class ChooseUser extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "ChooseUser";

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "user": ""
        };

    }

    // interface handlers

    private _handleChooseUser (e: React.ChangeEvent<HTMLSelectElement>, newValue: string): void {

        this.setState({
            "user": newValue
        });

    }

    private _handleLoadRepositoriesError (err: Error): void {

        this.setState({
            "user": ""
        });

        this.props.onError(err);

    }

    private _handleAnalyzeError (err: Error): void {

        this.props.onError(err);

    }

    // render

    private _renderUserSelector (): React.JSX.Element {

        return <Select label="Users" value={ this.state.user } onChange={ this._handleChooseUser.bind(this) }>

            <option value="">-</option>

            { [ "Psychopoulet", "Malky-dev" ].map((user: string): React.JSX.Element => {

                return <option key={ user } value={ user }>{ user }</option>;

            }) }

        </Select>;

    }

    public render (): React.JSX.Element {

        if ("" === this.state.user.trim()) {

            return <div className="row justify-content-md-center mt-3">

                <div className="col-12 col-md-6">

                    <Card>

                        <CardHeader>Choose a user</CardHeader>

                        <CardBody>

                            <Select label="Users" value={ this.state.user } onChange={ this._handleChooseUser.bind(this) }>

                                <option value="">-</option>

                                { [ "Psychopoulet", "Malky-dev" ].map((user: string): React.JSX.Element => {

                                    return <option key={ user } value={ user }>{ user }</option>;

                                }) }

                            </Select>

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
                        user={ this.state.user }
                    />

                </div>

            </div>;

        }

    }

}
