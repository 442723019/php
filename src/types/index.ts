// 机器状态类型
export interface MachineRealStatus {
  id: number;
  machineName: string;
  machineCode: string;
  dxfName: string;
  status: number;
  currentProgram: string;
  efficiency: number;
  powerOnTime: string;
  processTime: string;
  alarmTime: string;
  alarmCount: number;
  prapareTime: string;
  currentTime: string;
}

export interface MachineStatus {
  id: number;
  machineCode: string;
  status: number;
  ncPrg: string;
  dxfName: string;
  startTime: string;
  endTime: string;
  susTime: string;
}

export interface NcInfo {
  id: number;
  ncPrg: string;
  dxfName: string;
  cutLength: number;
  ncPicture: string;
  beginTime: string;
  sustainTime: string;
  endTime: string;
}

export interface History {
  id: number;
  machineCode: string;
  efficiency: number;
  powerOnTime: string;
  processTime: string;
  alarmTime: string;
  alarmCount: number;
  prapareTime: string;
  currentDate: string;
}

// 报警信息类型
export interface AlarmInfo {
  id: number;
  machineId: string;
  ncPrg: string;
  warnNumber: number;
  warnType: number;
  content: string;
  priority: number;
  startTime: string;
  endTime: string;
}

// 用户信息类型
export interface UserInfo {
  id: number;
  jobNumber: string;
  staffName: string;
  authority: number;
  company: string;
  lastLoginTime: string;
}

// 公司信息类型
export interface CompanyInfo {
  companyName: string;
  companyCode: string;
  country: string;
  province: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
} 