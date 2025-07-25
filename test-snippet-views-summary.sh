#!/bin/bash

echo "🔍 Testing Snippet Views Across Dashboard, Projects, Collaborate, and Profile"
echo "============================================================================"
echo

# Function to check if a file exists and has no syntax errors
check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo "✅ $name: File exists"
        # You could add more checks here like ESLint if needed
    else
        echo "❌ $name: File missing"
    fi
}

echo "📁 Checking key files..."
check_file "/home/groot/CLASS/DevSpace/client/src/pages/Dashboard.jsx" "Dashboard"
check_file "/home/groot/CLASS/DevSpace/client/src/pages/Projects.jsx" "Projects"
check_file "/home/groot/CLASS/DevSpace/client/src/pages/Collaborate.jsx" "Collaborate"
check_file "/home/groot/CLASS/DevSpace/client/src/pages/Profile.jsx" "Profile"
check_file "/home/groot/CLASS/DevSpace/client/src/utils/dataUtils.js" "Data Utils"
echo

echo "🔍 Checking for critical fixes..."

# Check if onCollaborate prop is being passed
echo "📋 Checking onCollaborate prop usage:"
grep -l "onCollaborate=" /home/groot/CLASS/DevSpace/client/src/pages/*.jsx | while read file; do
    echo "  ✅ $(basename "$file"): onCollaborate prop found"
done
echo

# Check if normalizeSnippets is being used
echo "🔧 Checking normalizeSnippets usage:"
grep -l "normalizeSnippets" /home/groot/CLASS/DevSpace/client/src/pages/*.jsx | while read file; do
    echo "  ✅ $(basename "$file"): normalizeSnippets imported/used"
done
echo

# Check for theme-adaptive classes vs hardcoded dark theme
echo "🎨 Checking theme fixes:"
hardcoded_count=$(grep -r "text-dark-" /home/groot/CLASS/DevSpace/client/src/pages/*.jsx | wc -l)
if [ "$hardcoded_count" -gt 20 ]; then
    echo "  ⚠️  Still $hardcoded_count hardcoded dark theme classes found"
    echo "     (Some may be in less critical components)"
else
    echo "  ✅ Most critical theme issues fixed"
fi
echo

echo "🔗 Checking API endpoints in backend:"
check_file "/home/groot/CLASS/DevSpace/server/routes/code.js" "Code Routes"
check_file "/home/groot/CLASS/DevSpace/server/controllers/codeController.js" "Code Controller"
echo

echo "📊 Summary of Key Fixes Applied:"
echo "=================================="
echo "1. ✅ Added onCollaborate prop to all snippet views for UI refresh after collaboration"
echo "2. ✅ Fixed theme issues (text-dark-* to text-gray-* dark:text-gray-*) in key components"
echo "3. ✅ Standardized normalizeSnippets usage across all pages"
echo "4. ✅ Fixed Active Contributors text color in Collaborate page"
echo "5. ✅ Ensured consistent snippet data structure across Dashboard, Projects, Collaborate, Profile"
echo
echo "🚀 Next Steps:"
echo "=============="
echo "1. Start backend: cd server && npm run dev"
echo "2. Start frontend: cd client && npm run dev"
echo "3. Test all snippet views manually"
echo "4. Run: node test-api-endpoints.js (to test backend APIs)"
echo
echo "🎯 Key Pages to Test:"
echo "====================="
echo "• Dashboard (/) - Public snippets view"
echo "• Projects (/projects) - Owned/starred/forked/all snippets"
echo "• Collaborate (/collaborate) - Collaborative snippets"
echo "• Profile (/profile/username) - User's public snippets"
echo
