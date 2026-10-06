import { useEffect, useRef, useState, type FormEvent } from "react";
import { Images, Trash2, Upload } from "lucide-react";
import { galleryApi, type GalleryPhoto } from "../services/api";

export function GalleryAdmin() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [category, setCategory] = useState("현장 스케치");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const load = () =>
    galleryApi
      .list()
      .then(setPhotos)
      .catch(() => setMessage("사진을 불러오지 못했습니다."));
  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!files.length) return setMessage("등록할 사진을 선택해 주세요.");
    const body = new FormData();
    body.append("year", year);
    body.append("category", category);
    body.append("title", title);
    body.append("description", description);
    files.forEach((file) => body.append("files", file));
    setSaving(true);
    setMessage("");
    try {
      const saved = await galleryApi.upload(body);
      setPhotos((current) => [...saved, ...current]);
      setFiles([]);
      setTitle("");
      setDescription("");
      if (input.current) input.current.value = "";
      setMessage(`${saved.length}장의 사진을 등록했습니다.`);
    } catch {
      setMessage("사진을 등록하지 못했습니다. 형식과 용량을 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (photo: GalleryPhoto) => {
    if (!window.confirm(`‘${photo.title}’ 사진을 삭제할까요?`)) return;
    try {
      await galleryApi.remove(photo.id);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
    } catch {
      setMessage("사진을 삭제하지 못했습니다.");
    }
  };

  return (
    <section className="gallery-admin">
      <div className="manage-title">
        <h2>갤러리 관리</h2>
        <span>대회 사진을 한 번에 최대 30장까지 등록할 수 있습니다.</span>
      </div>
      <form className="admin-form gallery-upload-form" onSubmit={submit}>
        <label>
          연도
          <input
            required
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </label>
        <label>
          분류
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>현장 스케치</option>
            <option>작품 전시</option>
            <option>발표</option>
            <option>시상식</option>
          </select>
        </label>
        <label className="full">
          사진 제목
          <input
            required
            maxLength={150}
            placeholder="예: 2026 대회 현장"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="full">
          설명
          <textarea
            maxLength={1000}
            placeholder="사진에 담긴 순간을 소개해 주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="gallery-file full">
          <Upload size={22} />
          <strong>
            {files.length ? `${files.length}장 선택됨` : "사진 선택"}
          </strong>
          <span>JPG, PNG, WEBP, GIF · 장당 최대 10MB</span>
          <input
            ref={input}
            required
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) =>
              setFiles(Array.from(e.target.files ?? []).slice(0, 30))
            }
          />
        </label>
        {files.length > 0 && (
          <div className="gallery-file-list full">
            {files.map((file) => (
              <span key={`${file.name}-${file.lastModified}`}>{file.name}</span>
            ))}
          </div>
        )}
        <button className="btn primary" disabled={saving}>
          {saving ? "등록 중…" : `${files.length || ""} 사진 등록`}
        </button>
        <p role="status">{message}</p>
      </form>
      <div className="manage-title gallery-list-title">
        <h2>등록된 사진</h2>
        <span>{photos.length}장</span>
      </div>
      {photos.length ? (
        <div className="gallery-admin-grid">
          {photos.map((photo) => (
            <article key={photo.id}>
              <img src={photo.imageUrl} alt="" loading="lazy" />
              <div>
                <small>
                  {photo.year} · {photo.category}
                </small>
                <strong>{photo.title}</strong>
              </div>
              <button
                type="button"
                onClick={() => void remove(photo)}
                aria-label={`${photo.title} 삭제`}
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-gallery-empty">
          <Images />
          <p>아직 등록된 사진이 없습니다.</p>
        </div>
      )}
    </section>
  );
}
