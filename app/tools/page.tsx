import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RiUploadCloudLine, RiArrowRightSLine } from '@remixicon/react';

const tools = [
  {
    name: '文件快传',
    description: '上传文件生成取件码，输入取件码即可下载',
    icon: RiUploadCloudLine,
    href: '/tools/file-transfer',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
];

export default function ToolsPage() {
  return (
    <div className="flex-1 flex flex-col items-center pt-16 pb-10 gap-8 px-4 w-full">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">工具箱</h1>
        <p className="text-muted-foreground">实用小工具集合</p>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg ${tool.bg} flex items-center justify-center`}>
                    <tool.icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <RiArrowRightSLine className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-2">{tool.name}</CardTitle>
                <CardDescription className="text-xs">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
