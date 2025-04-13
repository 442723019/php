import React, { useEffect, useState } from 'react';
import { Table, Card, message } from 'antd';
import type { History as HistoryType } from '../types';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';

const History: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<History[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await request.get<ApiResponse<History[]>>('/api/machines/history');
      if (response.data.success) {
        setData(response.data.data);
      } else {
        message.error(response.data.message || '获取历史数据失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取历史数据失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'machineCode',
      key: 'machineCode',
    },
    {
      title: '开机时间',
      dataIndex: 'powerOnTime',
      key: 'powerOnTime',
    },
    {
      title: '加工时间',
      dataIndex: 'processTime',
      key: 'processTime',
    },
    {
      title: '准备时间',
      dataIndex: 'prapareTime',
      key: 'prapareTime',
    },
    {
      title: '报警时间',
      dataIndex: 'alarmTime',
      key: 'alarmTime',
    },
    {
      title: '报警次数',
      dataIndex: 'alarmCount',
      key: 'alarmCount',
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: number) => `${efficiency}`,
    },
    {
      title: '日期',
      dataIndex: 'currentDate',
      key: 'currentDate',
    },
  ];

  return (
    <Card title="设备历史记录">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default History; 