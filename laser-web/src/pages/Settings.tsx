import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Switch, Select } from 'antd';
import request from '../utils/request';
import { ApiResponse } from '../utils/types';

interface SystemSettings {
  systemName: string;
  companyName: string;
  dataRetentionDays: number;
  autoBackup: boolean;
  backupTime: string;
  emailNotification: boolean;
  emailAddress: string;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Settings component mounted');
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      console.log('Fetching settings...');
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      
      const response = await request.get<ApiResponse<SystemSettings>>('/api/settings');
      console.log('Settings response:', response.data);
      
      if (response.data.success) {
        form.setFieldsValue(response.data.data);
      } else {
        message.error(response.data.message || '获取设置失败');
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      console.error('Error response:', error.response);
      message.error(error.response?.data?.message || '获取设置失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: SystemSettings) => {
    setLoading(true);
    try {
      console.log('Submitting settings:', values);
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      
      const response = await request.put<ApiResponse<null>>('/api/settings', values);
      console.log('Submit response:', response.data);
      
      if (response.data.success) {
        message.success('保存设置成功');
      } else {
        message.error(response.data.message || '保存设置失败');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      console.error('Error response:', error.response);
      message.error(error.response?.data?.message || '保存设置失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            systemName: '激光设备管理系统',
            companyName: '示例公司',
            dataRetentionDays: 30,
            autoBackup: true,
            backupTime: '00:00',
            emailNotification: false,
            emailAddress: '',
          }}
        >
          <Form.Item
            name="systemName"
            label="系统名称"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="companyName"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dataRetentionDays"
            label="数据保留天数"
            rules={[{ required: true, message: '请输入数据保留天数' }]}
          >
            <Input type="number" min={1} max={365} />
          </Form.Item>

          <Form.Item
            name="autoBackup"
            label="自动备份"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="backupTime"
            label="备份时间"
            rules={[{ required: true, message: '请选择备份时间' }]}
          >
            <Select>
              <Select.Option value="00:00">00:00</Select.Option>
              <Select.Option value="01:00">01:00</Select.Option>
              <Select.Option value="02:00">02:00</Select.Option>
              <Select.Option value="03:00">03:00</Select.Option>
              <Select.Option value="04:00">04:00</Select.Option>
              <Select.Option value="05:00">05:00</Select.Option>
              <Select.Option value="06:00">06:00</Select.Option>
              <Select.Option value="07:00">07:00</Select.Option>
              <Select.Option value="08:00">08:00</Select.Option>
              <Select.Option value="09:00">09:00</Select.Option>
              <Select.Option value="10:00">10:00</Select.Option>
              <Select.Option value="11:00">11:00</Select.Option>
              <Select.Option value="12:00">12:00</Select.Option>
              <Select.Option value="13:00">13:00</Select.Option>
              <Select.Option value="14:00">14:00</Select.Option>
              <Select.Option value="15:00">15:00</Select.Option>
              <Select.Option value="16:00">16:00</Select.Option>
              <Select.Option value="17:00">17:00</Select.Option>
              <Select.Option value="18:00">18:00</Select.Option>
              <Select.Option value="19:00">19:00</Select.Option>
              <Select.Option value="20:00">20:00</Select.Option>
              <Select.Option value="21:00">21:00</Select.Option>
              <Select.Option value="22:00">22:00</Select.Option>
              <Select.Option value="23:00">23:00</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="emailNotification"
            label="邮件通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="emailAddress"
            label="通知邮箱"
            rules={[
              { required: true, message: '请输入通知邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings; 