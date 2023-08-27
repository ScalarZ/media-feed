import { Product } from "@/schema";
import { SQL, sql } from "drizzle-orm";

export function getSQL<T extends { id: number }>(
  inputs: T[],
  ...updatedCols: (keyof T)[]
) {
  let sqlInputs: Record<keyof T, SQL> = {} as Record<keyof T, SQL>;
  const ids: number[] = [];
  for (let i = 0; i < updatedCols.length; i++) {
    const sqlChunks: SQL[] = [];
    sqlChunks.push(sql`(case`);
    for (const input of inputs) {
      sqlChunks.push(sql`when id = ${input.id} then ${input[updatedCols[i]]}`);
      //one loop is enough for get all the ids
      if (i === 0) {
        ids.push(input.id);
      }
    }
    sqlChunks.push(sql`end)`);
    const finalSQL = sql.join(sqlChunks, sql.raw(" "));
    sqlInputs[updatedCols[i]] = finalSQL;
  }

  return { sqlInputs, ids };
  // return { sql: sql.join(sqlChunks, sql.raw(" ")), ids };

  //   const res = await db
  //     .update(linksTable)
  //     .set({ position: finalSql })
  //     .where(inArray(linksTable.id, ids));
}
