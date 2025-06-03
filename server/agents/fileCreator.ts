export class FileCreatorAgent {
  private createdFiles: Map<number, string> = new Map();
  private currentId = 1;

  async createMarkdown(text: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const fileId = this.currentId++;
      const fileName = `file_${fileId}.md`;
      const localPath = `/tmp/${fileName}`;
      
      // Store the content in memory (simulating file creation)
      this.createdFiles.set(fileId, text);

      const result = {
        id: fileId,
        fileName,
        localPath,
        content: text,
        size: text.length,
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
      "FileCreator.createMarkdown(text) - Create a markdown file with the given text content"
    ];
  }
}

export const fileCreatorAgent = new FileCreatorAgent();
