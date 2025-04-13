import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Space, Button, Modal, message } from 'antd';
import { WarningOutlined } from '@ant-design/icons/lib/icons';
import type { AlarmInfo } from '../types';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';

const Alarms: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: '设备ID',
      dataIndex: 'machineId',
      key: 'machineId',
    },
    {
      title: '报警号',
      dataIndex: 'warnNumber',
      key: 'warnNumber',
    },
    {
      title: '报警类型',
      dataIndex: 'warnType',
      key: 'warnType',
      render: (type: number) => {
        const typeMap = {
          1: { color: 'warning', text: '一般警告' },
          2: { color: 'error', text: '严重错误' },
          3: { color: 'default', text: '提示信息' },
        };
        const current = typeMap[type as keyof typeof typeMap] || typeMap[1];
        return (
          <Tag color={current.color} icon={getAlarmIcon(current.text)}>
            {current.text}
          </Tag>
        );
      },
    },
    {
      title: '报警内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => {
        const colors = ['blue', 'orange', 'red'];
        return <Tag color={colors[priority - 1] || 'blue'}>{priority}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      sorter: (a: AlarmInfo, b: AlarmInfo) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AlarmInfo) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDetail(record)}>详情</Button>
          <Button type="link" onClick={() => handleProcess(record)}>处理</Button>
        </Space>
      ),
    },
  ];

  const handleDetail = (alarm: AlarmInfo) => {
    Modal.info({
      title: `报警详情 - ${alarm.machineId}`,
      content: (
        <div>
          <p>设备ID: {alarm.machineId}</p>
          <p>报警号: {alarm.warnNumber}</p>
          <p>报警内容: {alarm.content}</p>
          <p>开始时间: {alarm.startTime}</p>
          <p>结束时间: {alarm.endTime || '未结束'}</p>
        </div>
      ),
    });
  };

  const handleProcess = (alarm: AlarmInfo) => {
    Modal.confirm({
      title: '处理报警',
      content: '确认已处理此报警？',
      onOk() {
        message.success('报警已处理');
      },
    });
  };

  const getAlarmIcon = (type: string) => {
    return <WarningOutlined style={{ color: '#ff4d4f' }} rev={undefined} />;
  };

  useEffect(() => {
    const fetchAlarms = async () => {
      setLoading(true);
      try {
        const response = await request.get<ApiResponse<AlarmInfo[]>>('/api/alarms');
        if (response.data.success) {
          setAlarms(response.data.data);
        } else {
          message.error(response.data.message || '获取报警数据失败');
        }
      } catch (error: any) {
        console.error('Error fetching alarms:', error);
        message.error(error.response?.data?.message || '获取报警数据失败，请检查网络连接');
      } finally {
        setLoading(false);
      }
    };

    fetchAlarms();
    // 每分钟更新一次数据
    const timer = setInterval(fetchAlarms, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card 
      title="报警管理" 
      extra={
        <Space>
          <Button>导出记录</Button>
          <Button type="primary" danger>清除已处理</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={alarms}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default Alarms; 