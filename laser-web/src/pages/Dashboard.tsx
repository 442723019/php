import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons/lib/icons';
import type { MachineRealStatus } from '../types';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState({
    totalMachines: 0,
    runningMachines: 0,
    alarmMachines: 0,
    efficiency: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      console.log('Fetching statistics...');
      const response = await request.get<ApiResponse<MachineRealStatus[]>>('/api/machines/realtime');
      console.log('Response:', response.data);
      
      if (response.data.success) {
        const machines = response.data.data;
        console.log('Machines:', machines);
        
        // 计算运行中的设备（状态为1或2的设备）
        const runningCount = machines.filter(m => m.status === 2).length;
        
        // 计算有报警的设备（alarmCount > 0）
        const alarmCount = machines.filter(m => m.alarmCount > 0).length;
        
        // 计算平均效率
        const avgEfficiency = machines.reduce((sum, m) => {
          const efficiency = parseFloat(m.efficiency?.replace('%', '') || '0');
          return sum + efficiency;
        }, 0) / machines.length;

        console.log('Calculated statistics:', {
          totalMachines: machines.length,
          runningCount,
          alarmCount,
          avgEfficiency
        });

        setStatistics({
          totalMachines: machines.length,
          runningMachines: runningCount,
          alarmMachines: alarmCount,
          efficiency: Math.round(avgEfficiency),
        });
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
    fetchStatistics();
    // 每30秒更新一次数据
    const timer = setInterval(fetchStatistics, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h2>设备概览</h2>
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="设备总数"
              value={statistics.totalMachines}
              prefix={<ToolOutlined rev={undefined} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="运行中"
              value={statistics.runningMachines}
              prefix={<CheckCircleOutlined rev={undefined} />}
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
              prefix={<AlertOutlined rev={undefined} />}
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
              prefix={<ClockCircleOutlined rev={undefined} />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 