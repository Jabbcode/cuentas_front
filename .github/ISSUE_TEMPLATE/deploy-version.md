---
name: Deploy release
about: Despliega un tag vX.Y.Z del frontend a producción
title: 'Deploy Release vX.Y.Z'
labels: deploy
---

<!--
Producción: edita la versión y deja este comando en el cuerpo del issue.
El workflow valida que el tag exista antes de desplegar.

Snapshot de una PR: no uses este issue. Comenta en la PR:
  /deploy PRE        (o)   /deploy PRE-TEST
-->

/deploy vX.Y.Z
