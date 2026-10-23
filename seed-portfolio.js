const db = require('./src/database/models');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function seedPortfolio() {
  console.log('🚀 Starting Portfolio Mock Data Injection...');

  // 1. Ensure / update Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const userData = [
    { email: 'owner@example.com', name: 'Salman Alfarisi', role: 'owner' },
    { email: 'admin@example.com', name: 'Sarah Jenkins', role: 'admin' },
    { email: 'member@example.com', name: 'Deva Ramadhan', role: 'member' },
    { email: 'viewer@example.com', name: 'Nadia Putri', role: 'viewer' },
    { email: 'test@example.com', name: 'Alexandre Chen', role: 'member' },
  ];

  const userMap = {};
  for (const u of userData) {
    let [userRecord] = await db.User.findOrCreate({
      where: { email: u.email },
      defaults: {
        id: uuidv4(),
        name: u.name,
        email: u.email,
        password_hash: passwordHash,
      },
    });
    // Update name if different
    if (userRecord.name !== u.name) {
      userRecord.name = u.name;
      await userRecord.save();
    }
    userMap[u.email] = userRecord;
  }
  const ownerUser = userMap['owner@example.com'];
  const sarahUser = userMap['admin@example.com'];
  const devaUser = userMap['member@example.com'];
  const nadiaUser = userMap['viewer@example.com'];
  const alexUser = userMap['test@example.com'];

  // Clean old test workspaces or prepare fresh portfolio workspaces
  console.log('📦 Creating Workspaces...');
  
  // Workspace 1: Fintech Core Engineering
  let ws1 = await db.Workspace.findOne({ where: { name: 'Fintech Core Engineering' } });
  if (!ws1) {
    ws1 = await db.Workspace.create({
      id: uuidv4(),
      name: 'Fintech Core Engineering',
      description: 'Arsitektur sistem pembayaran real-time, gateway ISO-8583, settlement BI-FAST, dan kepatuhan standar PCI-DSS.',
      owner_id: ownerUser.id,
    });
  }

  // Workspace 2: NextGen Mobile Banking
  let ws2 = await db.Workspace.findOne({ where: { name: 'NextGen Mobile Banking' } });
  if (!ws2) {
    ws2 = await db.Workspace.create({
      id: uuidv4(),
      name: 'NextGen Mobile Banking',
      description: 'Pembaruan aplikasi mobile banking iOS & Android generasi terbaru dengan otentikasi biometrik dan UI mikro modern.',
      owner_id: ownerUser.id,
    });
  }

  // Ensure Workspace Members for ws1
  for (const email of Object.keys(userMap)) {
    const u = userMap[email];
    let memberRole = 'member';
    if (email === 'owner@example.com') memberRole = 'owner';
    if (email === 'admin@example.com') memberRole = 'admin';
    if (email === 'viewer@example.com') memberRole = 'viewer';

    await db.WorkspaceMember.findOrCreate({
      where: { workspace_id: ws1.id, user_id: u.id },
      defaults: {
        id: uuidv4(),
        workspace_id: ws1.id,
        user_id: u.id,
        role: memberRole,
        invited_at: new Date(),
      },
    });

    await db.WorkspaceMember.findOrCreate({
      where: { workspace_id: ws2.id, user_id: u.id },
      defaults: {
        id: uuidv4(),
        workspace_id: ws2.id,
        user_id: u.id,
        role: memberRole,
        invited_at: new Date(),
      },
    });
  }

  // 2. Projects in Fintech Core Engineering
  console.log('📁 Creating Projects...');
  
  // Project 1: Payment Gateway Engine v2
  let proj1 = await db.Project.findOne({ where: { name: 'Payment Gateway Engine v2', workspace_id: ws1.id } });
  if (!proj1) {
    proj1 = await db.Project.create({
      id: uuidv4(),
      workspace_id: ws1.id,
      name: 'Payment Gateway Engine v2',
      description: 'Modul pemrosesan transaksi real-time dengan idempotency key, webhook callback, dan distributed lock.',
      status: 'active',
      created_by: ownerUser.id,
    });
  }

  // Project 2: Fraud Detection & Analytics
  let proj2 = await db.Project.findOne({ where: { name: 'Fraud Detection & Realtime Analytics', workspace_id: ws1.id } });
  if (!proj2) {
    proj2 = await db.Project.create({
      id: uuidv4(),
      workspace_id: ws1.id,
      name: 'Fraud Detection & Realtime Analytics',
      description: 'Machine learning scoring engine untuk deteksi anomali pola transaksi berkecepatan tinggi.',
      status: 'active',
      created_by: sarahUser.id,
    });
  }

  // Project 3: Legacy Database Migration
  let proj3 = await db.Project.findOne({ where: { name: 'Core Banking Ledger Migration', workspace_id: ws1.id } });
  if (!proj3) {
    proj3 = await db.Project.create({
      id: uuidv4(),
      workspace_id: ws1.id,
      name: 'Core Banking Ledger Migration',
      description: 'Migrasi database transaksi monolithic ke distributed database cluster tanpa scheduled downtime.',
      status: 'completed',
      created_by: ownerUser.id,
    });
  }

  // 3. Tasks for Project 1 (Payment Gateway Engine v2)
  console.log('📋 Injecting Realistic Tasks...');
  
  const now = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const in5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const in10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const taskDefinitions = [
    // Done
    {
      title: 'Design idempotent transaction ledger schema with MySQL InnoDB',
      description: 'Implementasikan double-entry bookkeeping ledger schema dengan unique constraints dan idempotency key hash untuk mencegah duplicate charges.',
      status: 'done',
      priority: 'high',
      due_date: pastWeek,
      assignees: [ownerUser.id, devaUser.id],
      creator: ownerUser.id,
    },
    {
      title: 'Setup HMAC-SHA256 signature verification for webhook callbacks',
      description: 'Validasi incoming webhook headers dari payment providers (BCA, Mandiri, BRI) menggunakan HMAC-SHA256 secret key verification.',
      status: 'done',
      priority: 'high',
      due_date: pastWeek,
      assignees: [sarahUser.id],
      creator: sarahUser.id,
    },
    {
      title: 'Implement Redis distributed lock for concurrent settlement processing',
      description: 'Gunakan Redlock algorithm untuk mengamankan concurrent balance mutations pada batch settlements berkecepatan tinggi.',
      status: 'done',
      priority: 'high',
      due_date: pastWeek,
      assignees: [ownerUser.id, alexUser.id],
      creator: ownerUser.id,
    },
    {
      title: 'Setup Prometheus metric exporters and Grafana dashboard alerts',
      description: 'Export latency percentiles (p50, p95, p99), HTTP 5xx error rates, dan database connection pool health metrics.',
      status: 'done',
      priority: 'medium',
      due_date: pastWeek,
      assignees: [nadiaUser.id],
      creator: nadiaUser.id,
    },

    // In Progress
    {
      title: 'Integrate BI-FAST settlement batch runner with cron job',
      description: 'Implementasi automated batch runner untuk clearing transaksi BI-FAST setiap 15 menit dengan error retry backoff.',
      status: 'in_progress',
      priority: 'high',
      due_date: now, // Due Today!
      assignees: [ownerUser.id, devaUser.id],
      creator: ownerUser.id,
      comments: [
        { user: devaUser, content: 'Worker pool sudah berhasil diuji dengan mock payload 1.000 transaksi. Mengonsumsi memori rata-rata 85MB.' },
        { user: ownerUser, content: 'Bagus, pastikan transaction rollback diatur jika koneksi gateway bank timeout di step ketiga.' },
      ],
      attachments: [
        { name: 'bi-fast-settlement-flow.pdf', size: 2450000, mime: 'application/pdf' },
      ],
    },
    {
      title: 'Optimize high-throughput transaction queries with database indexing',
      description: 'Analisis slow query logs di production, tambahkan composite indexes pada tabel transactions (workspace_id, status, created_at).',
      status: 'in_progress',
      priority: 'high',
      due_date: yesterday, // Overdue! Critical for portfolio alert
      assignees: [ownerUser.id],
      creator: ownerUser.id,
      comments: [
        { user: sarahUser, content: 'Execution plan EXPLAIN menunjukkan query transactions sekarang sudah index scan, bukan full table scan lagi!' },
      ],
    },
    {
      title: 'Refactor Kafka consumer group rebalance on service restarts',
      description: 'Gunakan cooperative sticky assignor untuk meminimalkan consumer downtime saat pod Kubernetes restart atau autoscaling.',
      status: 'in_progress',
      priority: 'medium',
      due_date: in3Days,
      assignees: [devaUser.id, alexUser.id],
      creator: devaUser.id,
    },

    // Review
    {
      title: 'Socket.io real-time balance push notifications on transaction success',
      description: 'Kirim instantaneous websocket event ke frontend client saat webhook pembayaran diterima dan saldo terupdate.',
      status: 'review',
      priority: 'high',
      due_date: in3Days,
      assignees: [ownerUser.id, sarahUser.id],
      creator: ownerUser.id,
      comments: [
        { user: sarahUser, content: 'PR #142 sudah direview dan di-test bersama frontend. Response latency di browser di bawah 30ms. Approved!' },
      ],
      attachments: [
        { name: 'websocket-benchmark-latency.json', size: 142000, mime: 'application/json' },
      ],
    },
    {
      title: 'Implement circuit breaker with Resilience4j pattern on bank API timeouts',
      description: 'Cegah cascading failure saat API bank mengalami latency spike dengan membuka circuit setelah 5 kegagalan berturut-turut.',
      status: 'review',
      priority: 'medium',
      due_date: in5Days,
      assignees: [devaUser.id],
      creator: devaUser.id,
    },

    // To Do
    {
      title: 'Setup automated load testing with k6 (Target: 5,000 TPS)',
      description: 'Script skenario stress test end-to-end: pembuatan Virtual Account, pembayaran QRIS statis/dinamis, dan webhook callback.',
      status: 'todo',
      priority: 'high',
      due_date: in5Days,
      assignees: [alexUser.id, ownerUser.id],
      creator: ownerUser.id,
    },
    {
      title: 'Docker multi-stage build & Kubernetes Helm deployment manifests',
      description: 'Optimalkan container image size menggunakan Alpine Linux node runner, siapkan ConfigMaps, Secrets, dan HPA configuration.',
      status: 'todo',
      priority: 'medium',
      due_date: in10Days,
      assignees: [nadiaUser.id],
      creator: nadiaUser.id,
    },
    {
      title: 'Audit payload sanitization & OWASP Top 10 security hardening',
      description: 'Pastikan seluruh input requests tervalidasi skema Zod, proteksi terhadap NoSQL injection, XSS, dan rate limit endpoints.',
      status: 'todo',
      priority: 'low',
      due_date: in10Days,
      assignees: [alexUser.id],
      creator: ownerUser.id,
    },
  ];

  // Insert tasks & assignees & comments
  for (const tDef of taskDefinitions) {
    let task = await db.Task.findOne({ where: { title: tDef.title, project_id: proj1.id } });
    if (!task) {
      task = await db.Task.create({
        id: uuidv4(),
        project_id: proj1.id,
        title: tDef.title,
        description: tDef.description,
        status: tDef.status,
        priority: tDef.priority,
        due_date: tDef.due_date,
        created_by: tDef.creator,
      });
    }

    // Assignees
    for (const uId of tDef.assignees) {
      await db.TaskAssignee.findOrCreate({
        where: { task_id: task.id, user_id: uId },
        defaults: {
          id: uuidv4(),
          task_id: task.id,
          user_id: uId,
        },
      });
    }

    // Comments
    if (tDef.comments) {
      for (const c of tDef.comments) {
        const existingComment = await db.Comment.findOne({ where: { task_id: task.id, content: c.content } });
        if (!existingComment) {
          await db.Comment.create({
            id: uuidv4(),
            task_id: task.id,
            user_id: c.user.id,
            content: c.content,
          });
        }
      }
    }

    // Attachments
    if (tDef.attachments) {
      for (const a of tDef.attachments) {
        const existingAtt = await db.Attachment.findOne({ where: { task_id: task.id, file_name: a.name } });
        if (!existingAtt) {
          await db.Attachment.create({
            id: uuidv4(),
            task_id: task.id,
            file_name: a.name,
            file_url: `/uploads/${a.name}`,
            file_size: a.size,
            mime_type: a.mime,
            uploaded_by: ownerUser.id,
          });
        }
      }
    }
  }

  // 4. Inject Activity Logs for the workspace timeline
  console.log('📝 Injecting Activity Feed...');
  const activityLogs = [
    { action: 'add_comment', entity: 'comment', desc: 'menambahkan komentar pada task "Socket.io real-time balance push notifications"', user: sarahUser },
    { action: 'change_status', entity: 'task', desc: 'mengubah status task "Implement Redis distributed lock" menjadi Done', user: ownerUser },
    { action: 'upload_file', entity: 'attachment', desc: 'mengunggah dokumen "bi-fast-settlement-flow.pdf"', user: ownerUser },
    { action: 'assign', entity: 'task', desc: 'menugaskan Salman Alfarisi pada task "Integrate BI-FAST settlement batch runner"', user: devaUser },
    { action: 'create', entity: 'task', desc: 'membuat task "Setup automated load testing with k6"', user: ownerUser },
    { action: 'change_status', entity: 'task', desc: 'mengubah status task "Setup HMAC-SHA256 signature verification" menjadi Done', user: sarahUser },
    { action: 'invite', entity: 'member', desc: 'mengundang Alexandre Chen ke dalam workspace', user: ownerUser },
    { action: 'create', entity: 'project', desc: 'membuat project baru "Payment Gateway Engine v2"', user: ownerUser },
  ];

  for (let i = 0; i < activityLogs.length; i++) {
    const act = activityLogs[i];
    const logTime = new Date(Date.now() - (i + 1) * 35 * 60 * 1000); // spread over hours
    await db.ActivityLog.create({
      id: uuidv4(),
      workspace_id: ws1.id,
      user_id: act.user.id,
      action: act.action,
      entity_type: act.entity,
      description: act.desc,
      created_at: logTime,
      updated_at: logTime,
    });
  }

  // Save last active workspace to ws1 so it opens by default
  console.log(`✅ Success! Seeded Workspace: "${ws1.name}" (${ws1.id})`);
  console.log(`✅ Seeded Project: "${proj1.name}" (${proj1.id})`);
  console.log(`✅ Total tasks in project 1: ${taskDefinitions.length}`);
  process.exit(0);
}

seedPortfolio().catch(err => {
  console.error('❌ Seeder Error:', err);
  process.exit(1);
});
