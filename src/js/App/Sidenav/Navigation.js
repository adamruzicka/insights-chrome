import React, { Component } from 'react';
import { Nav, NavExpandable, NavList } from '@patternfly/react-core/dist/esm/components/Nav';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { appNavClick, clearActive } from '../../redux/actions';
import NavigationItem from './NavigationItem';

const basepath = `${document.baseURI}platform/`;

class Navigation extends Component {
    constructor(props) {
        super(props);
        this.onSelect = this.onSelect.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onSelect({ groupId, itemId }) {
        this.setState({
            activeGroup: groupId,
            activeItem: itemId
        });
    };

    onClick(_event, item, parent) {
        const { onNavigate, onClearActive } = this.props;
        if (parent && parent.active) {
            if (!item.reload) {
                onNavigate && onNavigate(item);
            } else {
                window.location.href = `${basepath}${item.reload}`;
            }
        } else {
            if (item.group && window.location.href.indexOf(item.group) !== -1) {
                onClearActive && onClearActive();
                onNavigate && onNavigate(item);
            } else {
                const prefix = parent ? parent.id : item.group || '';
                window.location.href = `${basepath}${prefix}${prefix ? '/' : ''}${item.id}`;
            }
        }
    }

    render() {
        const { settings, activeApp, navHidden } = this.props;
        if (navHidden) {
            document.querySelector('aside').setAttribute('hidden', true);
        }

        return (
            <Nav onSelect={this.onSelect} aria-label="Insights Global Navigation" >
                <NavList>
                    {
                        settings.map((item, key) => {
                            if (!item.disabled) {
                                if (item.subItems) {
                                    return <NavExpandable
                                        title={item.title}
                                        itemId={item.id}
                                        key={key}
                                        isActive={item.active}
                                        isExpanded={item.active}>
                                        {
                                            item.subItems.map((subItem, subKey) => (
                                                <NavigationItem
                                                    itemId={subItem.id}
                                                    key={subKey}
                                                    title={subItem.title}
                                                    parent={`${item.id}/`}
                                                    isActive={item.active && subItem.id === activeApp}
                                                    onClick={event => this.onClick(event, subItem, item)}
                                                />
                                            ))
                                        }
                                    </NavExpandable>;
                                } else {
                                    return <NavigationItem
                                        itemId={item.id}
                                        key={key}
                                        title={item.title}
                                        isActive={item.active || item.id === activeApp}
                                        onClick={event => this.onClick(event, item)}
                                    />;
                                }
                            }
                        })
                    }
                </NavList>
            </Nav>
        );
    }
}

Navigation.propTypes = {
    settings: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string,
            subItems: () => Navigation.propTypes.settings
        })
    )
};

function stateToProps({ chrome: { globalNav, activeApp, navHidden } }) {
    return ({ settings: globalNav, activeApp, navHidden });
}

function dispatchToProps(dispatch) {
    return {
        onNavigate: (item) => dispatch(appNavClick(item)),
        onClearActive: () => dispatch(clearActive())
    };
}

export default connect(stateToProps, dispatchToProps)(Navigation);
