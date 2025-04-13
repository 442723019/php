import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';

interface User {
  id: number;
  username: string;
  role: string;
  status: number;
  createTime: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await request.get<ApiResponse<User[]>>('/api/users');
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        message.error(response.data.message || '获取用户列表失败');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      message.error(error.response?.data?.message || '获取用户列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await request.delete<ApiResponse<null>>(`/api/users/${id}`);
      if (response.data.success) {
        message.success('删除用户成功');
        fetchUsers();
      } else {
        message.error(response.data.message || '删除用户失败');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      message.error(error.response?.data?.message || '删除用户失败，请检查网络连接');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'put' : 'post';
      
      const response = await request[method]<ApiResponse<User>>(url, values);
      if (response.data.success) {
        message.success(editingUser ? '更新用户成功' : '添加用户成功');
        setModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.data.message || (editingUser ? '更新用户失败' : '添加用户失败'));
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      message.error(error.response?.data?.message || '操作失败，请检查网络连接');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <span style={{ color: status === 1 ? '#52c41a' : '#ff4d4f' }}>
          {status === 1 ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="用户管理"
        extra={
          <Button type="primary" onClick={handleAdd}>
            添加用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请输入角色' }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 