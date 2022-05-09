export const poolQuery = `
  query($id: String) { pool(id: $id) {
    id
    address
    totalLiquidity
    totalShares
    poolType
    factory
  }
}
`;

//0xd6f52e8ab206e59a1e13b3d6c5b7f31e90ef46ef000200000000000000000028
