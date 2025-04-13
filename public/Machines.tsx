import React, { useEffect, useState } from 'react';
import { Card, Tag, Space, Button, Modal, message, Tabs } from 'antd';
import {
  PoweroffOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';
import type { MachineRealStatus, MachineStatus } from '../types';

const { TabPane } = Tabs;

// 自定义图标组件
const StatusIcon: React.FC<{ type: 'poweroff' | 'check' | 'warning' }> = ({ type }) => {
  switch (type) {
    case 'poweroff':
      return <PoweroffOutlined />;
    case 'check':
      return <CheckCircleOutlined />;
    case 'warning':
      return <WarningOutlined />;
    default:
      return <PoweroffOutlined />;
  }
};

const Machines: React.FC = () => {
  const [machines, setMachines] = useState<MachineRealStatus[]>([]);
  const [machinesStatusHistory, setMachinesStatusHistory] = useState<MachineStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const statusMap = {
    0: { color: 'default', text: '机床待机', iconType: 'poweroff' as const },
    1: { color: 'success', text: '机床运行', iconType: 'check' as const },
    2: { color: 'error', text: '机床暂停', iconType: 'warning' as const },
    3: { color: 'error', text: '紧急停止', iconType: 'warning' as const },
  };

  const columns: ProColumns<MachineRealStatus>[] = [
    {
      title: '设备名称',
      dataIndex: 'machineName',
      key: 'machineName',
      ellipsis: true,
    },
    {
      title: '设备编号',
      dataIndex: 'machineCode',
      key: 'machineCode',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const current = statusMap[record.status as keyof typeof statusMap] || statusMap[0];
        return (
          <Tag icon={<StatusIcon type={current.iconType} />} color={current.color}>
            {current.text}
          </Tag>
        );
      },
    },
    {
      title: '当前程序',
      dataIndex: 'currentProgram',
      key: 'currentProgram',
      ellipsis: true,
    },
    {
      title: 'DXF名称',
      dataIndex: 'dxfName',
      key: 'dxfName',
      ellipsis: true,
    },
    {
      title: '稼动率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (_, record) => `${record.efficiency}`,
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
      title: '待机时间',
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
      title: '更新时间',
      dataIndex: 'currentTime',
      key: 'currentTime',
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      render: (_, record) => [
        <Button type="link" key="detail" onClick={() => handleDetail(record)}>
          详情
        </Button>,
        <Button type="link" key="control" onClick={() => handleControl(record)}>
          控制
        </Button>,
      ],
    },
  ];

  const historyColumns: ProColumns<MachineStatus>[] = [
    {
      title: '设备编号',
      dataIndex: 'machineCode',
      key: 'machineCode',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const current = statusMap[record.status as keyof typeof statusMap] || statusMap[0];
        return (
          <Tag icon={<StatusIcon type={current.iconType} />} color={current.color}>
            {current.text}
          </Tag>
        );
      },
    },
    {
      title: '程序号',
      dataIndex: 'ncPrg',
      key: 'ncPrg',
      ellipsis: true,
    },
    {
      title: 'DXF名称',
      dataIndex: 'dxfName',
      key: 'dxfName',
      ellipsis: true,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '持续时间',
      dataIndex: 'susTime',
      key: 'susTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
    },
  ];

  const handleDetail = (machine: MachineRealStatus) => {
    Modal.info({
      title: `设备 ${machine.machineName} 详细信息`,
      content: (
        <div>
          <p>设备名称: {machine.machineName}</p>
          <p>设备编号: {machine.machineCode}</p>
          <p>当前程序: {machine.currentProgram}</p>
          <p>稼动率: {machine.efficiency}%</p>
          <p>开机时间: {machine.powerOnTime}</p>
          <p>加工时间: {machine.processTime}</p>
          <p>待机时间: {machine.prapareTime}</p>
          <p>报警时间: {machine.alarmTime}</p>
          <p>报警次数: {machine.alarmCount}</p>
        </div>
      ),
    });
  };

  const handleControl = (machine: MachineRealStatus) => {
    Modal.confirm({
      title: '设备控制',
      content: '确定要执行此操作吗？',
      onOk() {
        message.success('操作已发送');
      },
    });
  };

  const fetchMachines = async () => {
    setLoading(true);
    try {
      console.log('Fetching machines data...');
      const response = await request.get<ApiResponse<MachineRealStatus[]>>('/api/machines/realtime');
      console.log('Machines response:', response.data);
      
      if (response.data.success) {
        setMachines(response.data.data);
      } else {
        message.error(response.data.message || '获取设备数据失败');
      }
    } catch (error: any) {
      console.error('Error fetching machines:', error);
      message.error(error.response?.data?.message || '获取设备数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const fetchMachinesStatusHistory = async (current = 1, pageSize = 10) => {
    try {
      console.log('Fetching status history with params:', { current, pageSize });
      const response = await request.get<ApiResponse<{
        data: MachineStatus[];
        total: number;
      }>>('/api/machines/statusHistory', {
        params: {
          page: current,
          pageSize: pageSize,
        },
      });
      
      console.log('Status history response:', response.data);
      
      if (response.data.success) {
        // 检查数据结构
        const historyData = response.data.data;
        console.log('History data structure:', historyData);
        
        // 确保数据是数组
        const dataArray = Array.isArray(historyData) ? historyData : 
                         Array.isArray(historyData.data) ? historyData.data : [];
        
        setMachinesStatusHistory(dataArray);
        setHistoryPagination({
          current,
          pageSize,
          total: Array.isArray(historyData) ? historyData.length : 
                 typeof historyData.total === 'number' ? historyData.total : dataArray.length,
        });
      } else {
        message.error(response.data.message || '获取状态历史数据失败');
      }
    } catch (error: any) {
      console.error('Error fetching machines status history:', error);
      message.error(error.response?.data?.message || '获取状态历史数据失败，请检查网络连接');
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchMachinesStatusHistory();
    // 每30秒更新一次数据
    const timer = setInterval(() => {
      fetchMachines();
      fetchMachinesStatusHistory(historyPagination.current, historyPagination.pageSize);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleHistoryTableChange = (pagination: any) => {
    fetchMachinesStatusHistory(pagination.current, pagination.pageSize);
  };

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="设备列表" key="1">
          <Card>
            <ProTable<MachineRealStatus>
              columns={columns}
              dataSource={machines}
              rowKey="id"
              loading={loading}
              search={false}
              options={false}
              pagination={false}
              dateFormatter="string"
              headerTitle="设备实时状态"
              toolBarRender={false}
            />
          </Card>
        </TabPane>
        <TabPane tab="状态历史" key="2">
          <Card>
            <ProTable<MachineStatus>
              columns={historyColumns}
              dataSource={machinesStatusHistory}
              rowKey="id"
              loading={loading2}
              search={false}
              options={false}
              pagination={{
                current: historyPagination.current,
                pageSize: historyPagination.pageSize,
                total: historyPagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              onChange={handleHistoryTableChange}
              dateFormatter="string"
              headerTitle="设备状态历史"
              toolBarRender={false}
              locale={{
                emptyText: '暂无数据',
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Machines; 