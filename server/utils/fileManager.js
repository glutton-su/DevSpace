const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

class FileManager {
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  static async moveFile(sourcePath, destinationPath) {
    try {
      await fs.rename(sourcePath, destinationPath);
      return true;
    } catch (error) {
      console.error("Error moving file:", error);
      return false;
    }
  }

  static async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      console.error("Error getting file size:", error);
      return 0;
    }
  }

  static async compressImage(inputPath, outputPath, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = "jpeg",
    } = options;

    try {
      let sharpInstance = sharp(inputPath);

      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      switch (format) {
        case "jpeg":
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case "png":
          sharpInstance = sharpInstance.png({ quality });
          break;
        case "webp":
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality });
      }

      await sharpInstance.toFile(outputPath);
      return true;
    } catch (error) {
      console.error("Error compressing image:", error);
      return false;
    }
  }

  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  static isImageFile(filename) {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  static isCodeFile(filename) {
    const codeExtensions = [
      ".js", ".ts", ".jsx", ".jsx", ".py", ".java", ".cpp", ".c", ".h",
      ".css", ".html", ".xml", ".json", ".md", ".sql", ".php", ".rb",
      ".go", ".rs", ".swift", ".kt", ".dart", ".vue", ".scss", ".sass",
      ".less", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".txt"
    ];
    return codeExtensions.includes(this.getFileExtension(filename));
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static async cleanupOldFiles(directory, maxAge = 24 * 60 * 60 * 1000) {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error("Error cleaning up old files:", error);
    }
  }
}

module.exports = FileManager;