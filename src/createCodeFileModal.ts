import {
	ButtonComponent,
	DropdownComponent,
	Modal,
	normalizePath,
	Notice,
	TAbstractFile,
	TextComponent,
	TFile,
	TFolder
} from "obsidian";
import CodeFilesPlugin from "./main";

export class CreateCodeFileModal extends Modal {
	fileName = "My code file";
	fileExtension = this.plugin.settings.extensions[0];
	parent: TAbstractFile;

	constructor(private plugin: CodeFilesPlugin, parent?: TAbstractFile) {
		super(plugin.app);
		this.parent = parent ?? this.plugin.app.vault.getRoot();
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.addClass("create-code-file-modal");
		const fileNameInput = new TextComponent(contentEl);
		fileNameInput.inputEl.addClass("modal_input");
		fileNameInput.setValue(this.fileName);
		fileNameInput.inputEl.addEventListener("keypress", e => {
			if (e.key === "Enter") {
				this.complete();
			}
		});
		fileNameInput.onChange(value => this.fileName = value);

		const fileExtensionInput = new DropdownComponent(contentEl);
		fileExtensionInput.selectEl.addClass("modal_select");
		fileExtensionInput.addOptions(this.plugin.settings.extensions.reduce((acc, ext) => {
			acc[ext] = ext;
			return acc;
		}, {} as any));
		fileExtensionInput.setValue(this.fileExtension);
		fileExtensionInput.onChange(value => this.fileExtension = value);

		fileExtensionInput.selectEl.addEventListener("keypress", e => {
			if (e.key === "Enter") {
				this.complete();
			}
		});

		const submitButton = new ButtonComponent(contentEl);
		submitButton.setCta();
		submitButton.setButtonText("Create");
		submitButton.onClick(() => this.complete());

		fileNameInput.inputEl.focus();
	}

	async complete() {
		this.close();
		const parent = (this.parent instanceof TFile ? this.parent.parent : this.parent) as TFolder;
		const newPath = `${parent.path}/${this.fileName}.${this.fileExtension}`;
		const existingFile = this.app.vault.getAbstractFileByPath(normalizePath(newPath));
		if (existingFile && existingFile instanceof TFile) {
			new Notice("File already exists");
			const leaf = this.app.workspace.getLeaf(true);
			leaf.openFile(existingFile as any);
			return;
		}

		var fileData = "";
		if (this.fileExtension == "drawio.svg") {
			fileData = '<svg host="65bd71144e" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="1px" height="1px" viewBox="-0.5 -0.5 1 1" content="&lt;mxfile&gt;&lt;diagram id=&quot;412Slrum3qhfrmGuF0K3&quot; name=&quot;Page-1&quot;&gt;dZE9D4MgEIZ/DbtC0upsbbt0cuhM4Cok6Bmk0fbXVwNWie1C7n3e+4CDsKIZL5Z36oYSDKGJHAk7EUozNh2zfnnN8tSD2mrp0QZU+g0BJoE+tYQ+SnSIxukuhgLbFoSLGLcWhzjtgSae2vEadqAS3OzpXUunAk0P+WpcQdcqjM7o0RsNX5LDS3rFJQ4bxErCCovofNSMBZh5dctefN35j/u9mIXW/SiYgrX3JKL/YeUH&lt;/diagram&gt;&lt;/mxfile&gt;"> <defs/> <g/> </svg>'
		}

		const newFile = await this.app.vault.create(
			newPath,
			fileData,
			{}
		);
		if (this.fileExtension != "drawio.svg") {
			const leaf = this.app.workspace.getLeaf(true);
			leaf.openFile(newFile);
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
