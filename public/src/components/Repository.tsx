

// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardList,
        ListItem
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { tRepository } from "../sdk";

// props & state

    interface iProps extends iPropsNode {
        "repository": tRepository;
    }

// component

export default class Repository extends React.Component<iProps> {

    // name

        public static displayName: string = "Repository";

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
                <ListItem variant={ 0 < this.props.repository.open_issues ? "danger" : null }>issues: { this.props.repository.open_issues }</ListItem>

            </CardList>

        </Card>;

    }

}
