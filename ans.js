--- a/components/FloorPlan/FloorPlanTreeView/Structure2/TreeViewRowRightClick.js
+++ b/components/FloorPlan/FloorPlanTreeView/Structure2/TreeViewRowRightClick.js
@@ class TreeViewRowRightClick extends React.Component {
     constructor() {
       super();
       this.state = {
         filter: '',
         filteredData: null,
       };
     }
+
+    // 1) On mount, try to self-expand
+    componentDidMount() {
+      this.tryAutoExpand();
+    }
 
-    componentDidUpdate(prevProps) {
-      const { treePathToExpand, selectedLocateRack, filteredRackResults, keyIds, rowData, ancestorData, index, parentLevel, expanded } = this.props;
-      // … all of your coworker’s old filtered-rack and treePathToExpand logic …
-    }
+    // 2) On any relevant prop change, re-attempt
+    componentDidUpdate(prevProps) {
+      if (
+        prevProps.selectedLocateRack !== this.props.selectedLocateRack ||
+        prevProps.rowData.expanded    !== this.props.rowData.expanded
+      ) {
+        this.tryAutoExpand();
+      }
+    }
 
     onSelectItem = (e) => {
       e.preventDefault();
@@ (around handleFilter)
     handleFilter = (e) => {
       if (!e.target.value) {
         this.setState({
           filter: e.target.value,
           filteredData: null,
           showFilter: false,
         });
         return;
       }
       this.setFilteredData(this.props, e.target.value);
     }
+
+    // 3) Build the path from selectedLocateRack and auto-expand level by level
+    tryAutoExpand = () => {
+      const { selectedLocateRack, parentLevel, rowData, onExpandClick, index, ancestorData } = this.props;
+      if (!selectedLocateRack) return;
+
+      // derive path[0]=siteCd, [1]=struct, [2]=floor, [3]=subclass, [4]=vendor
+      const path = [
+        selectedLocateRack.siteCd,
+        selectedLocateRack.struct,
+        selectedLocateRack.floor,
+        selectedLocateRack.subclass,
+        selectedLocateRack.vendor
+      ];
+
+      // nothing to do if out of bounds or already expanded
+      if (parentLevel >= path.length || rowData.expanded) return;
+
+      // figure out this node’s value at `parentLevel`
+      const myValue = [
+        rowData.siteCd,
+        rowData.struct    || rowData.sctructNmTxt,
+        rowData.floor     || rowData.floorNmTxt,
+        rowData.eqpType   || rowData.subClass,
+        rowData.vendorName|| rowData.vendor
+      ][parentLevel];
+
+      // if it matches, trigger your expand callback
+      if (myValue === path[parentLevel]) {
+        onExpandClick(rowData, index, parentLevel, ancestorData);
+      }
+    }
 
     getEquipmentColorClass = (rowData) => {
       if(rowData.type){
