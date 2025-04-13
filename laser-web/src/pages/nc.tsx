import React, { useEffect, useState } from 'react';
import { Table, Card, message, Modal } from 'antd';
import type { History as HistoryType } from '../types';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';

interface NcInfo {
  id: number;
  ncPrg: string;
  dxfName: string;
  cutLength: number;
  ncPicture: string;
  beginTime: string;
  sustainTime: string;
  endTime: string;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

const NcInfo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NcInfo[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await request.get<ApiResponse<{ data: NcInfo[]; total: number }>>('/api/machines/ncInfo', {
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize
        }
      });
      if (response.data.success) {
        setData(response.data.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total
        }));
      } else {
        message.error(response.data.message || '获取NC数据失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '获取NC数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const handlePreview = (picture: string) => {
    if (!picture) {
      message.warning('暂无图片数据');
      return;
    }
    setPreviewImage(picture);
    setPreviewVisible(true);
  };

  const columns = [
    {
        title: '加工图形',
        dataIndex: 'ncPicture',
        key: 'ncPicture',
        render: (picture: string) => {
          if (!picture) return '-';
          return (
            <img 
              src={picture} 
              alt="加工图形" 
              style={{ 
                width: '100px', 
                height: '100px',
                objectFit: 'contain',
                cursor: 'pointer'
              }}
              onClick={() => handlePreview(picture)}
            />
          );
        },
      },
    {
      title: '加工程序名',
      dataIndex: 'ncPrg',
      key: 'ncPrg',
    },
    {
      title: 'dxf名称',
      dataIndex: 'dxfName',
      key: 'dxfName',
    },
    {
      title: '切割长度',
      dataIndex: 'cutLength',
      key: 'cutLength',
    },
    {
      title: '开始时间',
      dataIndex: 'beginTime',
      key: 'beginTime',
    },
    {
      title: '持续时间',
      dataIndex: 'sustainTime',
      key: 'sustainTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (efficiency: number) => `${efficiency}`,
    }
  ];

  return (
    <Card title="设备加工NC记录">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img 
          alt="加工图形预览" 
          style={{ width: '100%' }} 
          src={previewImage} 
        />
      </Modal>
    </Card>
  );
};

export default NcInfo; 