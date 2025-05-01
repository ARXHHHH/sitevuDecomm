--- a/components/FloorPlan/FloorPlanTreeView/Structure2/TreeViewRowRightClick.js
+++ b/components/FloorPlan/FloorPlanTreeView/Structure2/TreeViewRowRightClick.js
@@ componentDidUpdate(prevProps) {
-    // Insert transformedRack into filteredRackResults if it exists
-    const updatedRackResults = [...(filteredRackResults || []), ...(transformedRack ? [transformedRack] : [])];
+    // Insert transformedRack into filteredRackResults if it exists
+    const updatedRackResults = [...(filteredRackResults || []), ...(transformedRack ? [transformedRack] : [])];
     console.log('filtered result', updatedRackResults); //data stored here

-  const isFilterResultsChanged =
-    !this.processedFilterResults ||
-    prevProps.filteredRackResults !== filteredRackResults;
+  // detect if our *combined* results really changed
+  const isFilterResultsChanged =
+    !this.processedFilterResults ||
+    JSON.stringify(this.processedFilterResults) !== JSON.stringify(updatedRackResults);

-  if (isFilterResultsChanged && filteredRackResults && filteredRackResults.length > 0 && !expanded) {
-    // Set a flag to avoid reprocessing the same filtered results
-    this.processedFilterResults = filteredRackResults;
+  if (isFilterResultsChanged && updatedRackResults.length > 0 && !expanded) {
+    // remember we already processed *this* exact set of results
+    this.processedFilterResults = updatedRackResults;

     // Check if this node matches filtered results (simplified logic)
     let shouldExpand = false;

-    // Use a lookup object instead of multiple if/else statements
-    const levelChecks = {
-      0: () => filteredRackResults.some(r => /* … */),
+    // Re-use updatedRackResults for all level checks
+    const levelChecks = {
+      0: () => updatedRackResults.some(r => /* your existing siteId / clliCd check */),
       1: () => updatedRackResults.some(r => /* … */),
       2: () => updatedRackResults.some(r => /* … */),
       3: () => updatedRackResults.some(r => /* … */),
       4: () => updatedRackResults.some(r => /* … */)
     };

     const checkFn = levelChecks[parentLevel];
     if (checkFn) {
       shouldExpand = checkFn();
     }

-    // Only trigger expand if necessary
-    if (shouldExpand && !rowData.expanded && this.props.onExpandClick) {
-      // Debounce expansion to prevent UI freezing
-      setTimeout(() => {
-        this.props.onExpandClick(rowData, index, parentLevel, ancestorData, filteredRackResults);
-      }, 0);
-    }
+    // Only trigger expand if necessary, passing our combined updatedRackResults
+    if (shouldExpand && !rowData.expanded && this.props.onExpandClick) {
+      setTimeout(() => {
+        this.props.onExpandClick(
+          rowData,
+          index,
+          parentLevel,
+          ancestorData,
+          updatedRackResults
+        );
+      }, 0);
+    }
   }

   // —— your existing treePathToExpand block —— 
-  if (matchValue === treePathToExpand[level] && !expanded) {
-    this.props.onExpandClick(rowData, index, parentLevel, ancestorData);
-  }
+  if (matchValue === treePathToExpand[level] && !expanded) {
+    // also pass updatedRackResults here
+    this.props.onExpandClick(
+      rowData,
+      index,
+      parentLevel,
+      ancestorData,
+      updatedRackResults
+    );
+  }
 }
