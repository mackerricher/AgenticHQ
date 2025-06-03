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

      // Create Octokit instance with the user's token
      const octokit = new Octokit({
        auth: token,
      });

      // Get the authenticated user to determine the owner
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const owner = user.login;

      // Convert content to base64
      const contentBase64 = Buffer.from(content, 'utf8').toString('base64');

      // Check if file already exists to get its SHA
      let sha: string | undefined;
      try {
        const { data: existingFile } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
        });
        
        if ('sha' in existingFile) {
          sha = existingFile.sha;
        }
      } catch (error) {
        // File doesn't exist, which is fine
      }

      // Create or update the file
      const response = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Add ${path}`,
        content: contentBase64,
        ...(sha && { sha }), // Include SHA if file exists
      });

      return { 
        success: true, 
        result: {
          content: response.data.content,
          commit: response.data.commit,
          html_url: response.data.content?.html_url,
        }
      };
    } catch (error) {
      let errorMessage = "Failed to add file to repository";
      
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Invalid GitHub token. Please check your Personal Access Token in settings.";
        } else if (error.message.includes("404")) {
          errorMessage = "Repository not found. Make sure the repository exists and you have access.";
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

  getAvailableTools(): string[] {
    return [
      "GitHub.createRepo(name, description) - Create a new GitHub repository",
      "GitHub.addFile(repo, path, content) - Add a file to a repository"
    ];
  }
}

export const githubAgent = new GitHubAgent();
