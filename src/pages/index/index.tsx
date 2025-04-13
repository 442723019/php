import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { AtGrid } from 'taro-ui'
import './index.scss'

interface IState {
  statistics: {
    totalMachines: number;
    runningMachines: number;
    alarmMachines: number;
    efficiency: number;
  }
}

export default class Index extends Component<{}, IState> {
  constructor(props: {}) {
    super(props)
    this.state = {
      statistics: {
        totalMachines: 0,
        runningMachines: 0,
        alarmMachines: 0,
        efficiency: 0
      }
    }
  }

  componentDidMount() {
    this.fetchStatistics()
  }

  fetchStatistics = async () => {
    try {
      // 这里替换为实际的API地址
      const response = await fetch('http://localhost:3000/api/statistics')
      const data = await response.json()
      if (data.success) {
        this.setState({ statistics: data.data })
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  render() {
    const { statistics } = this.state

    return (
      <View className='index'>
        <View className='header'>
          <Text className='title'>设备概览</Text>
        </View>

        <AtGrid
          data={[
            {
              image: 'https://img12.360buyimg.com/jdphoto/s72x72_jfs/t6160/14/2008729947/2754/7d512a86/595c3aeeNa89ddf71.png',
              value: `${statistics.totalMachines}`,
              label: '总设备数'
            },
            {
              image: 'https://img20.360buyimg.com/jdphoto/s72x72_jfs/t15151/308/1012305375/2300/536ee6ef/5a411466N040a074b.png',
              value: `${statistics.runningMachines}`,
              label: '运行中'
            },
            {
              image: 'https://img10.360buyimg.com/jdphoto/s72x72_jfs/t5872/209/5240187906/2872/8fa98cd/595c3b2aN4155b931.png',
              value: `${statistics.alarmMachines}`,
              label: '报警设备'
            },
            {
              image: 'https://img12.360buyimg.com/jdphoto/s72x72_jfs/t10660/330/203667368/1672/801735d7/59c85643N31e68303.png',
              value: `${statistics.efficiency}%`,
              label: '平均稼动率'
            }
          ]}
        />
      </View>
    )
  }
} 