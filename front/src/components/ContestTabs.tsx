export type ContestTab = "apply" | "notices" | "questions";

const tabs: Array<{ id: ContestTab; label: string }> = [
    {id: "apply", label: "참가 신청"},
    {id: "notices", label: "공지사항"},
    {id: "questions", label: "Q&A"},
];

export function ContestTabs({
                                activeTab,
                                onChange,
                            }: {
    activeTab: ContestTab;
    onChange: (tab: ContestTab) => void;
}) {
    return (
        <div className="contest-tabs" role="tablist" aria-label="대회 상세 메뉴">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={activeTab === tab.id ? "active" : ""}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
