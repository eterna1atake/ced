


// ตารางแสดงรายการเนื้อหาในแอดมิน พร้อมสถานะและปุ่มแก้ไข
export type ContentItem = {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled';
  updatedAt: string;
};

type ContentTableProps = {
  items: ContentItem[];
};

// แมปสถานะเป็นข้อความที่อ่านง่ายบน UI
const statusLabel: Record<ContentItem['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  scheduled: 'Scheduled',
};

export default function ContentTable({ items }: ContentTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Title</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Status</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Updated</th>
              <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900 min-w-[200px]">{item.title}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 whitespace-nowrap">
                    {statusLabel[item.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.updatedAt}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button type="button" className="text-sm font-medium text-primary-nav hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
