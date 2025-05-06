// const UPDATE_INTERVAL = 100; // 1 second

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import os from 'os';
import fs from 'fs';

async function getSystemInfo() {
  const cpus = os.cpus();
  const cpuModel = cpus[0].model;
  const cpuCores = cpus.length;
  const coreUsages = cpus.map((cpu, index) => {
    const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
    const idle = cpu.times.idle;
    return {
      core: index + 1,
      usage: ((1 - idle / total) * 100).toFixed(1)
    };
  });
  
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const osType = os.type();
  const osRelease = os.release();
  
  const rootStats = fs.statfsSync('/');
  const totalStorage = rootStats.blocks * rootStats.bsize;
  const freeStorage = rootStats.bfree * rootStats.bsize;
  const usedStorage = totalStorage - freeStorage;
  
  return {
    cpu: {
      cores: coreUsages,
      model: cpuModel,
      totalCores: cpuCores,
      threads: cpuCores * 2,
      minFreq: cpus[0].speed / 1000,
      maxFreq: cpus[0].speed / 1000
    },
    memory: {
      used: Math.floor(usedMemory / (1024 * 1024)),
      total: Math.floor(totalMemory / (1024 * 1024)),
      type: 'RAM',
      os: `${osType} ${osRelease}`
    },
    storage: {
      used: Math.floor(usedStorage / (1024 * 1024)),
      total: Math.floor(totalStorage / (1024 * 1024)),
      type: 'Root Disk',
      speed: 0
    }
  };
}

export default async function Info() {
  const systemInfo = await getSystemInfo();

  return (
    <div className="grid gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 auto-rows-fr">
      {/* CPU Card */}
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-background/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
            CPU Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground font-medium line-clamp-1 mb-2">
              {systemInfo.cpu.model}
            </div>
            <div className="space-y-2">
              {systemInfo.cpu.cores.map((core) => (
                <div key={core.core} className="space-y-1">
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Core {core.core}</span>
                    <span>{core.usage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-in-out" 
                      style={{ width: `${core.usage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-1 text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500/70"></span>
                {systemInfo.cpu.totalCores} Cores / {systemInfo.cpu.threads} Threads
              </span>
              <span>{systemInfo.cpu.minFreq}GHz - {systemInfo.cpu.maxFreq}GHz</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Card */}
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-background/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold flex items-center gap-2">
              {(systemInfo.memory.used / 1024).toFixed(1)}GB 
            </div>
            <div className="text-sm text-muted-foreground font-medium mb-2">
              of {(systemInfo.memory.total / 1024).toFixed(1)}GB
            </div>
            <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-700 ease-in-out" 
                style={{ width: `${(systemInfo.memory.used / systemInfo.memory.total) * 100}%` }}
              ></div>
            </div>
            <div className="pt-1 text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/70"></span>
                {systemInfo.memory.type}
              </span>
              <span className="truncate">{systemInfo.memory.os}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Card */}
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-background/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold flex items-center gap-2">
              {(systemInfo.storage.used / 1024).toFixed(0)}GB
            </div>
            <div className="text-sm text-muted-foreground font-medium mb-2">
              of {(systemInfo.storage.total / 1024).toFixed(0)}GB
            </div>
            <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-700 ease-in-out" 
                style={{ 
                  width: systemInfo.storage.total > 0 
                    ? `${(systemInfo.storage.used / systemInfo.storage.total) * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
            <div className="pt-1 text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500/70"></span>
                {systemInfo.storage.type}
              </span>
              <span>{systemInfo.storage.speed > 0 ? `${systemInfo.storage.speed}MB/s` : 'Phisical Disk'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>      
  )
}