const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Add state
const stateTarget = `  const [editAdminRole, setEditAdminRole] = useState<'Super Admin' | 'Admin' | 'Editor' | 'Kalolsavam Editor'>('Admin');
  const [editAdminName, setEditAdminName] = useState('');`;

const stateReplacement = `  const [editAdminRole, setEditAdminRole] = useState<'Super Admin' | 'Admin' | 'Editor' | 'Kalolsavam Editor'>('Admin');
  const [editAdminName, setEditAdminName] = useState('');
  const [editingShakhaId, setEditingShakhaId] = useState<string | null>(null);
  const [editShakhaPassword, setEditShakhaPassword] = useState('');`;

content = content.replace(stateTarget, stateReplacement);

// 2. Add handleUpdateShakhaPassword
const handleAddAdminTarget = `  const handleAddAdminUser = async (e: React.FormEvent) => {`;
const handleUpdateShakhaReplacement = `  const handleUpdateShakhaPassword = async (shakhaId: string) => {
    if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') {
      triggerToast('Permission Denied: Only Super Admins or Admins can modify accounts!');
      return;
    }

    if (!editShakhaPassword.trim()) {
      triggerToast('Password cannot be empty.');
      return;
    }

    const updatedUnits = (dbData.units || []).map((u: any) => {
      if (u.id.toLowerCase() === shakhaId.toLowerCase()) {
        return {
          ...u,
          password: editShakhaPassword.trim()
        };
      }
      return u;
    });

    const updated = {
      ...dbData,
      units: updatedUnits
    };

    const success = await saveState(updated, 'UPDATE_SHAKHA_PASSWORD', \`Shakha \${shakhaId}\`);
    if (success) {
      setEditingShakhaId(null);
      setEditShakhaPassword('');
      triggerToast(\`Password for Shakha \${shakhaId} updated successfully!\`);
    }
  };

  const handleAddAdminUser = async (e: React.FormEvent) => {`;

content = content.replace(handleAddAdminTarget, handleUpdateShakhaReplacement);

// 3. Update UI
// Use regex to carefully replace the mapping function for dbData.units
const uiRegex = /\{\(dbData\.units \|\| \[\]\)\.map\(\(unit: any\) => \{[\s\S]*?return \([\s\S]*?<div key=\{unit\.id\} className="p-3\.5 bg-slate-50\/40 rounded-2xl border border-slate-100\/60 flex flex-col gap-2 border-l-4 border-l-amber-500 text-left">[\s\S]*?<div className="flex items-center justify-between gap-4">[\s\S]*?<div className="flex flex-col gap-1 flex-1">[\s\S]*?<span className="text-xs font-bold text-slate-700 flex items-center gap-1\.5">[\s\S]*?\{unit\.name\} Shakha[\s\S]*?<\/span>[\s\S]*?<span className="text-\[10px\] font-mono text-slate-500">Username: <strong className="text-slate-700">\{unit\.id\}<\/strong> \(or \{loginId\}\)<\/span>[\s\S]*?<span className="text-\[10px\] font-mono text-slate-500">Password: <strong className="text-slate-700">\{defaultPass\}<\/strong><\/span>[\s\S]*?<\/div>[\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<span className="px-2 py-1 rounded bg-white border border-slate-100 text-\[9px\] font-black text-amber-600 uppercase">[\s\S]*?SHAKHA[\s\S]*?<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}\)\}/;

const uiReplacement = `{(dbData.units || []).map((unit: any) => {
              const loginId = \`\${unit.id.toLowerCase()}@shakha.cml\`;
              const defaultPass = unit.password ? '********' : \`CML\${unit.id.toUpperCase()}\`;
              const isEditing = editingShakhaId === unit.id;
              return (
                <div key={unit.id} className={\`p-3.5 bg-slate-50/40 rounded-2xl border \${isEditing ? 'border-amber-500/50 bg-slate-50/90' : 'border-slate-100/60'} flex flex-col gap-2 border-l-4 border-l-amber-500 text-left transition duration-200\`}>
                  {!isEditing ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          {unit.name} Shakha
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Username: <strong className="text-slate-700">{unit.id}</strong> (or {loginId})</span>
                        <span className="text-[10px] font-mono text-slate-500">Password: <strong className="text-slate-700">{defaultPass}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-white border border-slate-100 text-[9px] font-black text-amber-600 uppercase">
                          SHAKHA
                        </span>
                        <button
                          onClick={() => {
                            setEditingShakhaId(unit.id);
                            setEditShakhaPassword('');
                          }}
                          className="p-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer active:scale-95 shrink-0"
                          title="Edit Password"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] uppercase font-mono font-black text-amber-500">Editing Password: {unit.name} Shakha</span>
                        <button onClick={() => setEditingShakhaId(null)} className="text-slate-600 hover:text-red-400 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-600 text-[9px] uppercase font-bold">New Password</label>
                        <input
                          type="text"
                          value={editShakhaPassword}
                          onChange={(e) => setEditShakhaPassword(e.target.value)}
                          placeholder={\`Default was: CML\${unit.id.toUpperCase()}\`}
                          className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => setEditingShakhaId(null)}
                          className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs transition font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateShakhaPassword(unit.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs transition font-black tracking-wider uppercase flex items-center gap-1.5 shadow-[0_2px_8px_rgba(245,158,11,0.15)]"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}`;

if (content.match(uiRegex)) {
  content = content.replace(uiRegex, uiReplacement);
  fs.writeFileSync('src/components/AdminDashboard.tsx', content);
  console.log('Restored Shakha password edit functionality.');
} else {
  console.log('Failed to match UI regex.');
}
