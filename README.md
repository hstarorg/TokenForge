# TokenForge

多链铸币应用：一个前端，多条链独立合约。

## 目录

```
web/                # Vite + React 前端
contracts/          # 各链合约（Foundry / Anchor / Move / Tact / Cairo）
deployments/        # 部署地址 JSON（单一事实源）
scripts/            # 工具脚本（sync-abi 等）
docs/spec.md        # 需求与设计文档
```

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动前端
pnpm build            # 构建前端
pnpm sync-abi         # 同步合约产物到前端

pnpm evm:build        # Foundry 编译
pnpm evm:test         # Foundry 测试
pnpm sol:build        # Anchor 编译
pnpm sol:test         # Anchor 测试
```

详细规划见 [docs/spec.md](docs/spec.md)。
