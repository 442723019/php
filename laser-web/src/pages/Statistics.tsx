import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, message, Table } from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { MachineRealStatus } from '../types';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState({
    totalMachines: 0,
    runningMachines: 0,
    alarmMachines: 0,
    efficiency: 0,
  });
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState<MachineRealStatus[]>([]);

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'machineName',
      key: 'machineName',
    },
    {
      title: '设备编号',
      dataIndex: 'machineCode',
      key: 'machineCode',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap = {
          0: { color: 'default', text: '机床待机' },
          1: { color: 'success', text: '机床运行' },
          2: { color: 'warning', text: '人工暂停' },
          3: { color: 'error', text: '机床报警' },
        };
        const current = statusMap[status as keyof typeof statusMap] || statusMap[0];
        return <span style={{ color: current.color }}>{current.text}</span>;
      },
    },
    {
      title: '当前程序',
      dataIndex: 'currentProgram',
      key: 'currentProgram',
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency: string) => efficiency || '0%',
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
      title: '报警次数',
      dataIndex: 'alarmCount',
      key: 'alarmCount',
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching statistics...');
      const response = await request.get<ApiResponse<MachineRealStatus[]>>('/api/machines/realtime');
      console.log('Response:', response.data);
      
      if (response.data.success) {
        const machinesData = response.data.data;
        console.log('Machines:', machinesData);
        
        // 计算运行中的设备（状态为1或2的设备）
        const runningCount = machinesData.filter(m => m.status === 1 || m.status === 2).length;
        
        // 计算有报警的设备（alarmCount > 0）
        const alarmCount = machinesData.filter(m => m.alarmCount > 0).length;
        
        // 计算平均效率
        const avgEfficiency = machinesData.reduce((sum, m) => {
          const efficiency = parseFloat(m.efficiency?.replace('%', '') || '0');
          return sum + efficiency;
        }, 0) / machinesData.length;

        console.log('Calculated statistics:', {
          totalMachines: machinesData.length,
          runningCount,
          alarmCount,
          avgEfficiency
        });

        setStatistics({
          totalMachines: machinesData.length,
          runningMachines: runningCount,
          alarmMachines: alarmCount,
          efficiency: Math.round(avgEfficiency),
        });

        setMachines(machinesData);
      } else {
        message.error(response.data.message || '获取设备数据失败');
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      message.error(error.response?.data?.message || '获取设备数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 每30秒更新一次数据
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h2>数据统计</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="设备总数"
              value={statistics.totalMachines}
              prefix={<ToolOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="运行中"
              value={statistics.runningMachines}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="报警数"
              value={statistics.alarmMachines}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="设备效率"
              value={statistics.efficiency}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="设备详细数据">
        <Table
          columns={columns}
          dataSource={machines}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Statistics; 