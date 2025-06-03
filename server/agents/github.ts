import { secretService } from "../secretService";
import { Octokit } from "@octokit/rest";

export class GitHubAgent {
  async createRepo(name: string, description: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const token = await secretService.getKey("github");
      if (!token) {
        return { 
          success: false, 
          error: "GitHub token not configured. Please add your GitHub Personal Access Token in settings." 
        };
      }

      // Create Octokit instance with the user's token
      const octokit = new Octokit({
        auth: token,
      });

      // Create the repository using GitHub API
      const response = await octokit.rest.repos.createForAuthenticatedUser({
        name,
        description: description || `Repository created by AgenticHQ`,
        private: false,
        auto_init: true,
      });

      const repo = response.data;
      return { 
        success: true, 
        result: {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          created_at: repo.created_at,
        }
      };
    } catch (error) {
      let errorMessage = "Failed to create repository";
      
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Invalid GitHub token. Please check your Personal Access Token in settings.";
        } else if (error.message.includes("422")) {
          errorMessage = "Repository name already exists or is invalid.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  async addFile(repo: string, path: string, content: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const token = await secretService.getKey("github");
      if (!token) {
        return { 
          success: false, 
          error: "GitHub token not configured" 
        };
      }

      // For MVP, simulate adding a file
      const mockResult = {
        content: {
          name: path.split('/').pop(),
          path,
          sha: Math.random().toString(36).substring(2, 15),
          size: content.length,
          html_url: `https://github.com/user/${repo}/blob/main/${path}`,
        },
        commit: {
          sha: Math.random().toString(36).substring(2, 15),
          message: `Add ${path}`,
        }
      };

      return { success: true, result: mockResult };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add file to repository" 
      };
    }
  }

  getAvailableTools(): string[] {
    return [
      "GitHub.createRepo(name, description) - Create a new GitHub repository",
      "GitHub.addFile(repo, path, content) - Add a file to a repository"
    ];
  }
}

export const githubAgent = new GitHubAgent();
