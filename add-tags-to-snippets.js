const { CodeSnippet, Tag } = require('./server/models');

async function addTagsToSnippets() {
  try {
    console.log('Adding tags to snippets...');
    
    // Create some sample tags
    const tags = await Promise.all([
      Tag.findOrCreate({ where: { name: 'javascript' } }),
      Tag.findOrCreate({ where: { name: 'python' } }),
      Tag.findOrCreate({ where: { name: 'web-dev' } }),
      Tag.findOrCreate({ where: { name: 'algorithm' } }),
      Tag.findOrCreate({ where: { name: 'tutorial' } }),
      Tag.findOrCreate({ where: { name: 'beginner' } }),
      Tag.findOrCreate({ where: { name: 'advanced' } }),
      Tag.findOrCreate({ where: { name: 'utility' } }),
    ]);
    
    const tagInstances = tags.map(([tag]) => tag);
    console.log('Created tags:', tagInstances.map(t => t.name));
    
    // Get all snippets
    const snippets = await CodeSnippet.findAll();
    console.log(`Found ${snippets.length} snippets`);
    
    // Add random tags to snippets
    for (const snippet of snippets) {
      // Randomly select 1-3 tags for each snippet
      const numTags = Math.floor(Math.random() * 3) + 1;
      const selectedTags = [];
      
      for (let i = 0; i < numTags; i++) {
        const randomTag = tagInstances[Math.floor(Math.random() * tagInstances.length)];
        if (!selectedTags.find(t => t.id === randomTag.id)) {
          selectedTags.push(randomTag);
        }
      }
      
      // Add language-specific tags
      if (snippet.language === 'javascript') {
        const jsTag = tagInstances.find(t => t.name === 'javascript');
        if (jsTag && !selectedTags.find(t => t.id === jsTag.id)) {
          selectedTags.push(jsTag);
        }
      } else if (snippet.language === 'python') {
        const pyTag = tagInstances.find(t => t.name === 'python');
        if (pyTag && !selectedTags.find(t => t.id === pyTag.id)) {
          selectedTags.push(pyTag);
        }
      }
      
      await snippet.setTags(selectedTags);
      console.log(`Added tags to snippet "${snippet.title}": ${selectedTags.map(t => t.name).join(', ')}`);
    }
    
    console.log('✅ Successfully added tags to all snippets!');
    
  } catch (error) {
    console.error('❌ Error adding tags:', error);
  } finally {
    process.exit(0);
  }
}

addTagsToSnippets();
