import React, { useEffect, useState } from 'react';
import { List, Tag, Button, Spin, Empty, Typography, Space, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import request from '../../utils/request';
import './index.scss';

interface IMachine {
  id: number;
  machineName: string;
  machineCode: string;
  status: number;
  currentProgram: string;
  efficiency: number;
  powerOnTime: string;
  processTime: string;
  alarmCount: number;
}

interface IState {
  machines: IMachine[];
  loading: boolean;
  error: string | null;
}

const { Title } = Typography;

const Machines: React.FC = () => {
  const [state, setState] = useState<IState>({
    machines: [],
    loading: false,
    error: null
  });

  const fetchMachines = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      console.log('Fetching machines data...');
      const response = await request.get('/api/machines/realtime');
      console.log('Response:', response);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || '获取数据失败');
      }

      const machines = response.data.data || [];
      console.log('Machines data:', machines);

      setState(prev => ({
        ...prev,
        machines,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error fetching machines:', error);
      const errorMessage = error.response?.data?.message || error.message || '获取设备数据失败';
      message.error(errorMessage);
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchMachines();
    // 设置定时刷新，每5秒更新一次数据
    const timer = setInterval(fetchMachines, 5000);
    return () => clearInterval(timer);
  }, []);

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="success">待机</Tag>;
      case 1:
        return <Tag color="success">运行中</Tag>;
      case 2:
        return <Tag color="warning">暂停</Tag>;
      case 3:
        return <Tag color="error">报警</Tag>;
      default:
        return <Tag>离线</Tag>;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  const handleRefresh = () => {
    fetchMachines();
  };

  return (
    <div className='machines-page'>
      <div className='header'>
        <Title level={4}>设备管理</Title>
        <Button 
          icon={<ReloadOutlined rev={undefined} />} 
          onClick={handleRefresh}
          loading={state.loading}
        />
      </div>

      {state.error && (
        <div className='error-message'>
          {state.error}
        </div>
      )}

      <Spin spinning={state.loading}>
        <List
          dataSource={state.machines}
          renderItem={machine => (
            <List.Item
              key={machine.id}
              actions={[getStatusTag(machine.status)]}
            >
              <List.Item.Meta
                title={`${machine.machineName || '未命名设备'} (${machine.machineCode || 'N/A'})`}
                description={
                  <Space direction="vertical">
                    <span>当前程序: {machine.currentProgram || '无'}</span>
                    <span>效率: {machine.efficiency || 0}%</span>
                    <span>开机时间: {machine.powerOnTime || '0'}</span>
                    <span>加工时间: {machine.processTime || '0'}</span>
                    <span>报警次数: {machine.alarmCount || 0}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="暂无设备数据" />
          }}
        />
      </Spin>

      <div className='debug-info' style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h4>调试信息</h4>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Machines; 