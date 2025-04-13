import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons/lib/icons';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { ApiResponse, UserInfo } from '../utils/types';
import { AxiosResponse } from 'axios';

interface LoginForm {
  jobNumber: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      console.log('准备发送登录请求到:', 'http://localhost:3000/api/auth/login');
      console.log('登录数据:', values);
      const response = await request.post<ApiResponse<UserInfo>>('/api/auth/login', values);
      console.log('收到响应:', response);
      
      if (response.data.success) {
        // 保存token和用户信息
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('user', JSON.stringify(response.data.data));
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(response.data.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误详情:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      });
      message.error(error.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>激光设备管理系统</h1>
          <p style={{ color: '#666', marginTop: 12 }}>登录以继续操作</p>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="jobNumber"
            rules={[{ required: true, message: '请输入工号' }]}
          >
            <Input 
              prefix={<UserOutlined rev={undefined} />} 
              placeholder="工号" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined rev={undefined} />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 