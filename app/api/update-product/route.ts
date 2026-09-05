import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import yaml from "js-yaml";

// Initialize Octokit with the GitHub Personal Access Token
const octokit = new Octokit({
  auth: process.env.ACCESS_TOKEN,
});

const REPO_OWNER = "ujjwal-pixel-oss";
const REPO_NAME = "FR-001";
const FILE_PATH = "public/data/products.yaml";

export async function POST(request: Request) {
  try {
    if (!process.env.ACCESS_TOKEN) {
      console.error("Missing ACCESS_TOKEN environment variable");
      return NextResponse.json(
        { error: "Server configuration error: Missing GitHub Access Token" },
        { status: 500 }
      );
    }

    const { id, name, price, description } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Get the current file content (SHA is needed for update)
    let fileData;
    try {
      const response = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
      });
      fileData = response.data;
    } catch (e: any) {
      console.error("Error fetching file:", e);
      return NextResponse.json(
        { error: `Failed to fetch products.yaml: ${e.message}` },
        { status: 500 }
      );
    }

    if (!fileData || Array.isArray(fileData) || !("content" in fileData)) {
      return NextResponse.json(
        { error: "Invalid file format or file not found" },
        { status: 500 }
      );
    }

    // Decode content
    const content = Buffer.from(fileData.content, "base64").toString("utf8");
    const products: any[] = yaml.load(content) as any[];

    // 2. Update the specific product
    const updatedProducts = products.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          name,
          price: price || null,
          Description: description, // Note: YAML uses 'Description' with capital D based on file
        };
      }
      return p;
    });

    // Convert back to YAML
    const newYaml = yaml.dump(updatedProducts);
    const newContentEncoded = Buffer.from(newYaml).toString("base64");

    // 3. Create a new branch
    const branchName = `update-product-${id}-${Date.now()}`;
    
    // Get main branch reference to branch off from
    const { data: refData } = await octokit.rest.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: "heads/main",
    });

    // Create the new branch
    await octokit.rest.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });

    // 4. Commit the file to the new branch
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: `Update product ${id}: ${name}`,
      content: newContentEncoded,
      branch: branchName,
      sha: fileData.sha, // SHA of the file we are replacing
    });

    // 5. Create a Pull Request
    const { data: prData } = await octokit.rest.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `Update Product: ${name} (${id})`,
      body: `Automated update request for product **${name}**.\n\n**Changes:**\n- Price: ${price}\n- Description: ${description}`,
      head: branchName,
      base: "main",
    });

    return NextResponse.json({ success: true, prUrl: prData.html_url });

  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
