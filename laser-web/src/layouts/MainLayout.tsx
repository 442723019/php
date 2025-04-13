import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  ToolOutlined,
  AlertOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import './MainLayout.scss';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'dashboard',
      icon: React.createElement(DashboardOutlined, { style: { fontSize: '18px' } }),
      label: '设备概览',
    },
    {
      key: 'machines',
      icon: React.createElement(ToolOutlined, { style: { fontSize: '18px' } }),
      label: '设备管理',
    },
    {
      key: 'history',
      icon: React.createElement(ToolOutlined, { style: { fontSize: '18px' } }),
      label: '历史信息',
    },
    {
      key: 'alarms',
      icon: React.createElement(AlertOutlined, { style: { fontSize: '18px' } }),
      label: '报警管理',
    },
    {
      key: 'ncInfo',
      icon: React.createElement(AlertOutlined, { style: { fontSize: '18px' } }),
      label: '加工记录',
    },
    {
      key: 'statistics',
      icon: React.createElement(BarChartOutlined, { style: { fontSize: '18px' } }),
      label: '数据统计',
    },
    {
      key: 'users',
      icon: React.createElement(TeamOutlined, { style: { fontSize: '18px' } }),
      label: '用户管理',
    },
    {
      key: 'settings',
      icon: React.createElement(SettingOutlined, { style: { fontSize: '18px' } }),
      label: '系统设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  return (
    <Layout className="main-layout">
      <Sider width={200} theme="light">
        <div className="logo">激光设备管理系统</div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="header-right">
            <span className="user-info">
              {JSON.parse(localStorage.getItem('user') || '{}').name || '未登录'}
            </span>
            <a onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}>
              退出登录
            </a>
          </div>
        </Header>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 