import { Menu } from 'antd';
import React from 'react';
import { Link, RouteProps } from 'react-router-dom';
import { COLORS } from 'src/theme/colors';
import styled from 'styled-components';

const SideDrawerMenuItem: React.FC<SideDrawerMenuItemProps> = ({
  item,
  closeSider,
  ...other
}) => {
  let menuItem: React.ReactNode;
  if (item.children) {
    menuItem = (
      <Menu.SubMenu
        key={item.id}
        title={
          <>
            {item.icon ? <item.icon /> : null}
            {item.title}
          </>
        }
        {...other}
      >
        {item.children.map((subItem: MenuItem) => (
          <SideDrawerMenuItem
            key={subItem.id}
            item={subItem}
            closeSider={closeSider}
            {...other}
          />
        ))}
      </Menu.SubMenu>
    );
  } else {
    menuItem = (
      <Menu.Item key={item.id} {...other}>
        {item.icon ? <item.icon /> : null}
        {item.title}
      </Menu.Item>
    );
  }
  return (
    <>
      {item.location ? (
        <Link to={{ pathname: item.location.path }} onClick={closeSider}>
          {menuItem}
        </Link>
      ) : (
        menuItem
      )}
    </>
  );
};

const SideDrawerMenu: React.FC<SideDrawerMenuProps> = ({
  items,
  closeSider,
}) => (
  <Wrapper>
    <Menu mode="inline">
      {items.map((item: MenuItem, index) => (
        <SideDrawerMenuItem key={index} item={item} closeSider={closeSider} />
      ))}
    </Menu>
  </Wrapper>
);

const Wrapper = styled.div`
  flex: auto;
  max-height: 100%;
  overflow: scroll;

  .ant-menu {
    background: ${COLORS.backgroundLightGray};
    font-weight: bold;

    .ant-menu-item {
      margin: 0;

      &:after {
        display: none;
      }
    }

    .ant-menu-submenu {
      .ant-menu-submenu-title {
        margin: 0;
      }
      .ant-menu-sub {
        background-color: inherit;
      }
    }

    a,
    .ant-menu-item-only-child {
      color: inherit;
    }

    a .ant-menu-item-selected {
      color: white;
      background: ${COLORS.link} !important;
    }
  }
`;

export interface MenuItem {
  id: string;
  icon?: React.FunctionComponent<{}> | React.ComponentClass<{}, any>;
  title: string;
  children?: Array<MenuItem>;
  location?: { path: string };
}

interface SideDrawerMenuItemProps extends RouteProps {
  item: MenuItem;
  closeSider: () => void;
}

interface SideDrawerMenuProps extends RouteProps {
  items: Array<MenuItem>;
  closeSider: () => void;
}

export default SideDrawerMenu;
