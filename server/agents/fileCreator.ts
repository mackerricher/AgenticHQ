export class FileCreatorAgent {
  private createdFiles: Map<number, string> = new Map();
  private currentId = 1;

  async createMarkdown(filename: string, contents: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const fileId = this.currentId++;
      const fileName = filename.endsWith('.md') ? filename : `${filename}.md`;
      const localPath = `/tmp/${fileName}`;
      
      // Store the content in memory (simulating file creation)
      this.createdFiles.set(fileId, contents);

      const result = {
        id: fileId,
        fileName,
        localPath,
        content: contents,
        size: contents.length,
        createdAt: new Date().toISOString(),
      };

      return { success: true, result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create markdown file" 
      };
    }
  }

  getCreatedFile(id: number): string | undefined {
    return this.createdFiles.get(id);
  }

  getAvailableTools(): string[] {
    return [
      "FileCreator.createMarkdown(filename, contents) - Create a markdown file with the specified filename and contents"
    ];
  }
}

export const fileCreatorAgent = new FileCreatorAgent();
