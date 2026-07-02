 #!/bin/bash
   # Dieses Skript berechnet die einfache Zinsen basierend auf dem Kapital,
   # dem jährlichen Zinssatz und der Zeitspanne in Jahren.

   # Verwenden Sie dies nicht in der Produktion. Nur für Beispielzwecke.

   # Autor: Upkar Lidder (IBM)
   # Zusätzliche Autoren:
   # <Ihr GitHub-Benutzername>

   # Eingabe:
   # p, Kapitalbetrag
   # t, Zeitspanne in Jahren
   # r, jährlicher Zinssatz

   # Ausgabe:
   # einfache Zinsen = p*t*r

   echo "Geben Sie das Kapital ein:"
   read p
   echo "Geben Sie die Zeitspanne in Jahren ein:"
   read t
   echo "Geben Sie den Zinssatz pro Jahr ein:"
   read r

   s=$(echo "scale=2; $p * $t * $r / 100" | bc)
   echo "Die einfachen Zinsen betragen: "
   echo $s
