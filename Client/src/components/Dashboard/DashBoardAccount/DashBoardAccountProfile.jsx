import React from 'react';

const DashBoardAccountProfile = ({account}) => (

    <div>
        <div className="field has-addons">
            <p className="control is-expanded">

                <button className="button is-fullwidth">
                    @{account.username}
                </button>
            </p>
            <p className="control">
                <a href={`https://instagram.com/${account.username}`} target="_blank">
                    <button className="button is-warning">
                        <i className="fas fa-external-link-square-alt" />
                    </button>
                </a>
            </p>
        </div>
        <div className="field has-addons">
            <div className="control">
                <button className="button is-small has-text-grey-light">
                    Followers
                </button>
            </div>
            <div className="control is-expanded">
                <button className="button is-small is-fullwidth">
                    {account.followers}
                </button>
            </div>
        </div>
        <div className="field has-addons">
            <div className="control">
                <button className="button is-small has-text-grey-light">
                    Following
                </button>
            </div>
            <div className="control is-expanded">
                <button className="button is-small is-fullwidth">
                    {account.following}
                </button>
            </div>
        </div>
        <div>
            <button className="button is-fullwidth is-small">
                <span className="icon">
                    <i className="fas fa-cog"/>
                </span>
                <span>
                    Configurer
                </span>
            </button>
        </div>
    </div>
);

export default DashBoardAccountProfile;