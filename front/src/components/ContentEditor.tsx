import {useEffect, useRef} from "react";

export function ContentEditor({
                                  value,
                                  onChange,
                                  placeholder,
                                  title = "공지 본문",
                                  helper = "줄바꿈으로 문단을 구분해 주세요.",
                              }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    title?: string;
    helper?: string;
}) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerText !== value) {
            editorRef.current.innerText = value;
        }
    }, [value]);

    return (
        <div className="content-editor">
            <div className="content-editor-top">
                <span>{title}</span>
                <small>{helper}</small>
            </div>
            <div
                ref={editorRef}
                className="content-editor-area"
                contentEditable
                role="textbox"
                aria-multiline="true"
                data-placeholder={placeholder}
                suppressContentEditableWarning
                onInput={(event) => onChange(event.currentTarget.innerText)}
            />
        </div>
    );
}
